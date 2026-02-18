package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.WeatherDto;

public interface WeatherNotificationService {

    void notifySevereWeather(String city, WeatherDto weather);
    void checkWeatherAlerts();
    void checkCityWeather(String city);
}
