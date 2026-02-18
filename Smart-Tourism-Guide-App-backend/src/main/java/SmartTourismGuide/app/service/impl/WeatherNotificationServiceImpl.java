package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.response.WeatherDto;
import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import SmartTourismGuide.app.service.NotificationService;
import SmartTourismGuide.app.service.WeatherNotificationService;
import SmartTourismGuide.app.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherNotificationServiceImpl implements WeatherNotificationService {

    private final WeatherService weatherService;
    private final NotificationService notificationService;

    // Major Indian cities to monitor
    private static final List<String> MONITORED_CITIES = Arrays.asList(
            "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
            "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow");

    @Override
    public void notifySevereWeather(String city, WeatherDto weather) {
        log.info("Sending severe weather notification for city: {}", city);

        String title = buildAlertTitle(weather);
        String message = buildAlertMessage(weather);
        NotificationPriority priority = determineAlertPriority(weather);

        notificationService.sendToLocation(
                city,
                NotificationType.WEATHER_ALERT,
                title,
                message,
                priority);
    }

    @Override
    @Scheduled(cron = "0 0 */3 * * *")
    public void checkWeatherAlerts() {
        log.info("Running scheduled weather alert check for {} cities", MONITORED_CITIES.size());

        for (String city : MONITORED_CITIES) {
            try {
                WeatherDto weather = weatherService.getWeatherByCity(city);

                if (isSevereWeather(weather)) {
                    log.warn("Severe weather detected in {}: {}", city, weather.getDescription());
                    notifySevereWeather(city, weather);
                }
            } catch (Exception e) {
                log.error("Error checking weather for city {}: {}", city, e.getMessage());
            }
        }

        log.info("Completed weather alert check");
    }

    @Override
    public void checkCityWeather(String city) {
        log.info("Manual weather check triggered for city: {}", city);

        try {
            WeatherDto weather = weatherService.getWeatherByCity(city);

            if (isSevereWeather(weather)) {
                notifySevereWeather(city, weather);
            } else {
                log.info("No severe weather detected in {}", city);
            }
        } catch (Exception e) {
            log.error("Error checking weather for city {}: {}", city, e.getMessage());
            throw e;
        }
    }

    private boolean isSevereWeather(WeatherDto weather) {
        if (weather == null) {
            return false;
        }

        // Temperature extremes (< 5°C or > 40°C)
        if (weather.getTemperature() != null) {
            double temp = weather.getTemperature();
            if (temp < 5.0 || temp > 40.0) {
                log.debug("Extreme temperature detected: {}°C", temp);
                return true;
            }
        }

        // High wind speed (> 50 km/h = 13.89 m/s)
        if (weather.getWindSpeed() != null && weather.getWindSpeed() > 13.89) {
            log.debug("High wind speed detected: {} m/s", weather.getWindSpeed());
            return true;
        }

        // Very low visibility (< 1000m)
        if (weather.getVisibility() != null && weather.getVisibility() < 1000) {
            log.debug("Low visibility detected: {}m", weather.getVisibility());
            return true;
        }

        // Severe weather conditions
        String condition = weather.getCondition();
        if (condition != null) {
            String conditionLower = condition.toLowerCase();
            if (conditionLower.contains("thunderstorm") ||
                    conditionLower.contains("tornado") ||
                    conditionLower.contains("hurricane") ||
                    conditionLower.contains("snow") ||
                    conditionLower.contains("hail")) {
                log.debug("Severe weather condition detected: {}", condition);
                return true;
            }
        }

        // Heavy rain (description contains "heavy")
        String description = weather.getDescription();
        if (description != null && description.toLowerCase().contains("heavy")) {
            log.debug("Heavy precipitation detected: {}", description);
            return true;
        }

        return false;
    }

    private String buildAlertTitle(WeatherDto weather) {
        if (weather.getTemperature() != null) {
            double temp = weather.getTemperature();
            if (temp > 40.0) {
                return "Extreme Heat Alert";
            } else if (temp < 5.0) {
                return "Cold Wave Alert";
            }
        }

        if (weather.getWindSpeed() != null && weather.getWindSpeed() > 13.89) {
            return "High Wind Alert";
        }

        String condition = weather.getCondition();
        if (condition != null) {
            if (condition.toLowerCase().contains("thunderstorm")) {
                return "Thunderstorm Warning";
            } else if (condition.toLowerCase().contains("snow")) {
                return "Snowfall Alert";
            }
        }

        return "Severe Weather Alert";
    }

    private String buildAlertMessage(WeatherDto weather) {
        StringBuilder message = new StringBuilder();

        message.append(weather.getDescription()).append(". ");

        if (weather.getTemperature() != null) {
            message.append(String.format("Temperature: %.1f°C. ", weather.getTemperature()));
        }

        if (weather.getWindSpeed() != null && weather.getWindSpeed() > 10) {
            message.append(String.format("Wind speed: %.1f m/s. ", weather.getWindSpeed()));
        }

        if (weather.getVisibility() != null && weather.getVisibility() < 2000) {
            message.append(String.format("Visibility: %dm. ", weather.getVisibility()));
        }

        message.append("Please take necessary precautions.");

        return message.toString();
    }

    private NotificationPriority determineAlertPriority(WeatherDto weather) {
        // Critical conditions
        if (weather.getTemperature() != null) {
            double temp = weather.getTemperature();
            if (temp < 0.0 || temp > 45.0) {
                return NotificationPriority.CRITICAL;
            }
        }

        if (weather.getWindSpeed() != null && weather.getWindSpeed() > 20.0) {
            return NotificationPriority.CRITICAL;
        }

        String condition = weather.getCondition();
        if (condition != null) {
            String conditionLower = condition.toLowerCase();
            if (conditionLower.contains("tornado") || conditionLower.contains("hurricane")) {
                return NotificationPriority.CRITICAL;
            }
            if (conditionLower.contains("thunderstorm")) {
                return NotificationPriority.HIGH;
            }
        }

        // Default to HIGH for severe weather
        return NotificationPriority.HIGH;
    }
}
