package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavigationResponseDto {
    private CoordinateDto source;
    private CoordinateDto destination;
    private Double distance; // in kilometers
    private String estimatedTravelTime; // e.g., "15 minutes"
}
