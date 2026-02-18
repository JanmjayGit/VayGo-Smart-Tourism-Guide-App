package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponseDto {

    private Long id;
    private Long placeId;
    private String placeName;
    private String placeCategory;
    private String city;
    private BigDecimal rating;
    private String imageUrl;
    private LocalDateTime savedAt;
    private Boolean isFavorite;
}
