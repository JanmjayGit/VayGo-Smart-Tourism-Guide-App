package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.TravelSuitability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String location;
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Double feelsLike;
    private String condition;
    private String description;
    private Integer humidity;
    private Double windSpeed;
    private Integer pressure;
    private Integer visibility;
    private TravelSuitability travelSuitability;
    private LocalDateTime timestamp;
    private Boolean cached;
}
