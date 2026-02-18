package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.PlaceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDto {
    private Long id;
    private String name;
    private PlaceCategory category;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double distance; // Calculated distance in km
    private BigDecimal rating;
    private String imageUrl;
    private Integer priceRange;
    private String address;
}
