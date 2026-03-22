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
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal pricePerNight;
    private BigDecimal rating;
    private String imageUrl;
    private List<String> imageUrls; // multi-image gallery
    private List<String> amenities;
    private Boolean availabilityStatus;
    private Boolean verified;
    private Double distance;
    private List<RoomResponseDto> rooms; // available room types
    private String submittedByUsername;
}
