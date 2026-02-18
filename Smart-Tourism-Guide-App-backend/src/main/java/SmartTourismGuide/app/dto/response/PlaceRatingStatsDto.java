package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceRatingStatsDto {

    private Long placeId;
    private String placeName;
    private BigDecimal averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution; // {5: 120, 4: 80, 3: 30, 2: 10, 1: 5}
}
