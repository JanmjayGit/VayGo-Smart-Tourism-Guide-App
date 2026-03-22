package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.PlaceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDetailsDto {
    private Long id;
    private String name;
    private String description;
    private PlaceCategory category;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private BigDecimal rating;
    private Long popularity;
    private Long reviewCount; // == popularity; kept as separate named field for frontend
    private String imageUrl;
    private List<String> imageUrls;
    private String city;
    private String contactInfo;
    private String openingHours;
    private Integer priceRange;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
