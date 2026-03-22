package SmartTourismGuide.app.dto.update;

import jakarta.validation.constraints.*;
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
public class UpdateHotelDto {

    @Size(max = 200, message = "Hotel name too long")
    private String name;

    @Size(max = 1000, message = "Description too long")
    private String description;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    @Size(max = 100, message = "City name too long")
    private String city;

    @Size(max = 500, message = "Address too long")
    private String address;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerNight;

    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    private BigDecimal rating;

    @Size(max = 500, message = "Image URL too long")
    private String imageUrl;
    private List<String> imageUrls;

    @Size(max = 100, message = "Contact info too long")
    private String contactInfo;

    private String openingHours; // JSON format

    @Min(value = 1, message = "Price range must be between 1 and 4")
    @Max(value = 4, message = "Price range must be between 1 and 4")
    private Integer priceRange;

    private String amenities; // JSON array

    private Boolean availabilityStatus;
}
