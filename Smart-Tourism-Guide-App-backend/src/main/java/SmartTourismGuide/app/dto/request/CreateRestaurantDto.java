package SmartTourismGuide.app.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRestaurantDto {

    @NotBlank(message = "Restaurant name is required")
    @Size(max = 200, message = "Name too long")
    private String name;

    @Size(max = 1000, message = "Description too long")
    private String description;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name too long")
    private String city;

    @Size(max = 500, message = "Address too long")
    private String address;

    @NotBlank(message = "Cuisine type is required")
    @Size(max = 50, message = "Cuisine type too long")
    private String cuisineType; // Indian, Chinese, Italian, Mexican, Thai, etc.

    @NotBlank(message = "Food category is required")
    @Size(max = 50, message = "Food category too long")
    private String foodCategory; // Veg, Non-Veg, Cafe, Fast Food, Fine Dining

    @DecimalMin(value = "0.0", message = "Average price must be non-negative")
    private BigDecimal avgPriceForTwo;

    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    private BigDecimal rating;

    @Size(max = 500, message = "Image URL too long")
    private String imageUrl;

    @Size(max = 100, message = "Contact info too long")
    private String contactInfo;

    private String openingHours; // JSON: {"monday":"9:00-22:00", ...}

    @Min(value = 1, message = "Price range must be between 1 and 4")
    @Max(value = 4, message = "Price range must be between 1 and 4")
    private Integer priceRange; // 1=Budget, 2=Moderate, 3=Expensive, 4=Luxury

    private String popularDishes; // JSON: ["Biryani", "Butter Chicken", "Naan"]

    private String amenities; // JSON: ["Delivery", "Dine-in", "Takeaway", "Parking"]

    @lombok.Builder.Default
    private Boolean active = true;
}
