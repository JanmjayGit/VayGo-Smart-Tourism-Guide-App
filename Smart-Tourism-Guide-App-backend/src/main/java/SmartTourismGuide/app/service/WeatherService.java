package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.WeatherDto;

public interface WeatherService {

    WeatherDto getWeatherByCoordinates(Double lat, Double lon);
    WeatherDto getWeatherByCity(String city);
    WeatherDto getWeatherForPlace(Long placeId);
}
