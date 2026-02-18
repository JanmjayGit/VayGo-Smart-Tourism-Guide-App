package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Boolean enableEventAlerts;
    private Boolean enableWeatherAlerts;
    private Boolean enableEmergencyAlerts;
    private Boolean enableRecommendationAlerts;
    private List<String> preferredCities;
    private Integer notificationRadiusKm;
    private LocalTime quietHoursStart;
    private LocalTime quietHoursEnd;
}
