package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.external.OpenWeatherResponse;
import SmartTourismGuide.app.dto.response.WeatherDto;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.TravelSuitability;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.exceptions.WeatherApiException;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements WeatherService {

    private final WebClient weatherWebClient;
    private final PlaceRepository placeRepository;

    @Value("${weather.api.key}")
    private String apiKey;

    @Override
    @Cacheable(value = "weather", key = "#lat + ':' + #lon")
    public WeatherDto getWeatherByCoordinates(Double lat, Double lon) {
        log.info("Fetching weather for coordinates: lat={}, lon={}", lat, lon);

        validateLatitude(lat);
        validateLongitude(lon);

        try {
            // Call OpenWeatherMap API
            String url = String.format("/weather?lat=%s&lon=%s&appid=%s&units=metric",
                    lat, lon, apiKey);

            OpenWeatherResponse response = weatherWebClient.get()
                    .uri(url)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(),
                            clientResponse -> Mono.error(new WeatherApiException(
                                    "Invalid request to weather API: " + clientResponse.statusCode())))
                    .onStatus(status -> status.is5xxServerError(),
                            clientResponse -> Mono.error(new WeatherApiException(
                                    "Weather API server error: " + clientResponse.statusCode())))
                    .bodyToMono(OpenWeatherResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response == null) {
                throw new WeatherApiException("Empty response from weather API");
            }

            // Transform to WeatherDto
            return transformToWeatherDto(response, false);

        } catch (Exception e) {
            log.error("Error fetching weather data: {}", e.getMessage());
            // Return fallback response
            return getFallbackWeather("Location (" + lat + ", " + lon + ")");
        }
    }

    @Override
    @Cacheable(value = "weather", key = "'city:' + #city")
    public WeatherDto getWeatherByCity(String city) {
        log.info("Fetching weather for city: {}", city);

        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City name cannot be empty");
        }

        try {
            // Call OpenWeatherMap API
            String url = String.format("/weather?q=%s&appid=%s&units=metric",
                    city, apiKey);

            OpenWeatherResponse response = weatherWebClient.get()
                    .uri(url)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(),
                            clientResponse -> Mono.error(new WeatherApiException(
                                    "City not found or invalid API key")))
                    .onStatus(status -> status.is5xxServerError(),
                            clientResponse -> Mono.error(new WeatherApiException(
                                    "Weather API server error")))
                    .bodyToMono(OpenWeatherResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response == null) {
                throw new WeatherApiException("Empty response from weather API");
            }

            // Transform to WeatherDto
            return transformToWeatherDto(response, false);

        } catch (Exception e) {
            log.error("Error fetching weather for city {}: {}", city, e.getMessage());
            // Return fallback response
            return getFallbackWeather(city);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public WeatherDto getWeatherForPlace(Long placeId) {
        log.info("Fetching weather for place ID: {}", placeId);

        // Fetch place
        Place place = placeRepository.findByIdAndDeletedFalse(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        // Get weather by coordinates
        Double lat = place.getLatitude() != null ? place.getLatitude().doubleValue() : null;
        Double lon = place.getLongitude() != null ? place.getLongitude().doubleValue() : null;

        if (lat == null || lon == null) {
            throw new IllegalArgumentException("Place does not have valid coordinates");
        }

        WeatherDto weather = getWeatherByCoordinates(lat, lon);

        // Override location with place name
        weather.setLocation(place.getName());

        return weather;
    }

     // Transform OpenWeatherResponse to WeatherDto.
    private WeatherDto transformToWeatherDto(OpenWeatherResponse response, boolean cached) {
        String condition = response.getWeather() != null && !response.getWeather().isEmpty()
                ? response.getWeather().get(0).getMain()
                : "Unknown";

        String description = response.getWeather() != null && !response.getWeather().isEmpty()
                ? response.getWeather().get(0).getDescription()
                : "No description available";

        Double temperature = response.getMain() != null ? response.getMain().getTemp() : null;
        Double feelsLike = response.getMain() != null ? response.getMain().getFeelsLike() : null;
        Integer humidity = response.getMain() != null ? response.getMain().getHumidity() : null;
        Integer pressure = response.getMain() != null ? response.getMain().getPressure() : null;
        Double windSpeed = response.getWind() != null ? response.getWind().getSpeed() : null;

        // Calculate travel suitability
        TravelSuitability suitability = calculateTravelSuitability(condition, temperature, windSpeed);

        // Convert timestamp
        LocalDateTime timestamp = response.getDt() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(response.getDt()), ZoneId.systemDefault())
                : LocalDateTime.now();

        return WeatherDto.builder()
                .location(response.getName())
                .latitude(response.getCoord() != null ? response.getCoord().getLat() : null)
                .longitude(response.getCoord() != null ? response.getCoord().getLon() : null)
                .temperature(temperature)
                .feelsLike(feelsLike)
                .condition(condition)
                .description(description)
                .humidity(humidity)
                .windSpeed(windSpeed)
                .pressure(pressure)
                .visibility(response.getVisibility())
                .travelSuitability(suitability)
                .timestamp(timestamp)
                .cached(cached)
                .build();
    }

     // Calculate travel suitability based on weather conditions.
    private TravelSuitability calculateTravelSuitability(String condition, Double temp, Double windSpeed) {
        if (condition == null || temp == null) {
            return TravelSuitability.UNKNOWN;
        }

        String conditionLower = condition.toLowerCase();

        // AVOID - Severe weather
        if (conditionLower.contains("storm") || conditionLower.contains("tornado") ||
                conditionLower.contains("hurricane") || conditionLower.contains("squall")) {
            return TravelSuitability.AVOID;
        }

        // POOR - Heavy rain or extreme temperatures
        if (conditionLower.contains("thunderstorm") || conditionLower.contains("drizzle") ||
                temp < 5 || temp > 40) {
            return TravelSuitability.POOR;
        }

        // POOR - Strong winds
        if (windSpeed != null && windSpeed > 15) {
            return TravelSuitability.POOR;
        }

        // FAIR - Rain or cloudy with acceptable temps
        if (conditionLower.contains("rain") || conditionLower.contains("mist") ||
                conditionLower.contains("fog")) {
            return TravelSuitability.FAIR;
        }

        // EXCELLENT - Clear/sunny with ideal temps
        if ((conditionLower.contains("clear") || conditionLower.contains("sun")) &&
                temp >= 15 && temp <= 30) {
            return TravelSuitability.EXCELLENT;
        }

        // GOOD - Partly cloudy or acceptable conditions
        if (temp >= 10 && temp <= 35) {
            return TravelSuitability.GOOD;
        }

        // Default to FAIR
        return TravelSuitability.FAIR;
    }

     // Get fallback weather response when API fails.
    private WeatherDto getFallbackWeather(String location) {
        log.warn("Returning fallback weather for: {}", location);

        return WeatherDto.builder()
                .location(location)
                .temperature(null)
                .condition("UNAVAILABLE")
                .description("Weather data temporarily unavailable. Please try again later.")
                .travelSuitability(TravelSuitability.UNKNOWN)
                .timestamp(LocalDateTime.now())
                .cached(false)
                .build();
    }


    // Validate latitude range (-90 to 90).
    private void validateLatitude(Double lat) {
        if (lat == null || lat < -90.0 || lat > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
    }

    // Validate longitude range (-180 to 180).
    private void validateLongitude(Double lon) {
        if (lon == null || lon < -180.0 || lon > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
    }
}
