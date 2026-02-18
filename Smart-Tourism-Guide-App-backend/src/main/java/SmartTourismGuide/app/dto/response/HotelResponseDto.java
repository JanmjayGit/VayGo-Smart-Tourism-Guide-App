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
public class HotelResponseDto {

    private Long id;
    private String name;
    private String city;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal pricePerNight;
    private BigDecimal rating;
    private String imageUrl;
    private List<String> amenities; // Parsed from JSON
    private Boolean availabilityStatus;
    private Double distance; // Calculated distance in km (for nearby searches)
}
