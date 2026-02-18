package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponseDto {

    private Long id;
    private String name;
    private String city;
    private String address;

    // Location
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Restaurant-specific
    private String cuisineType;
    private String foodCategory;
    private BigDecimal avgPriceForTwo;
    private BigDecimal rating;

    // Media
    private String imageUrl;

    // Parsed fields
    private List<String> popularDishes; // Parsed from JSON
    private List<String> amenities; // Parsed from JSON (delivery, dine-in, takeaway)

    // Status
    private Boolean active;

    // Calculated
    private Double distance; // Distance in km (null if not location-based search)
}
