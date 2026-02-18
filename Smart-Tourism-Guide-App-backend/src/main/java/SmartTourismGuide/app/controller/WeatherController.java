package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.WeatherDto;
import SmartTourismGuide.app.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/location")
    public ResponseEntity<WeatherDto> getWeatherByLocation(
            @RequestParam Double lat,
            @RequestParam Double lon) {

        WeatherDto weather = weatherService.getWeatherByCoordinates(lat, lon);
        return ResponseEntity.ok(weather);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<WeatherDto> getWeatherByCity(@PathVariable String city) {
        WeatherDto weather = weatherService.getWeatherByCity(city);
        return ResponseEntity.ok(weather);
    }

    @GetMapping("/place/{placeId}")
    public ResponseEntity<WeatherDto> getWeatherForPlace(@PathVariable Long placeId) {
        WeatherDto weather = weatherService.getWeatherForPlace(placeId);
        return ResponseEntity.ok(weather);
    }
}
