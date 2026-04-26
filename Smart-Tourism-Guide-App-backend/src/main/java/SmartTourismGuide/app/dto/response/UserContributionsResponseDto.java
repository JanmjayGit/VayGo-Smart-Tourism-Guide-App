package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserContributionsResponseDto {
    private List<ContributionResponseDto> places;
    private List<ContributionResponseDto> events;
    private List<ContributionResponseDto> hotels;
}