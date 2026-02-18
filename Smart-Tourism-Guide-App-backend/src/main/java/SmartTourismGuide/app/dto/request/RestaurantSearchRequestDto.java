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
public class RestaurantSearchRequestDto {

    // Location-based search
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @DecimalMin(value = "0.1", message = "Radius must be at least 0.1 km")
    @DecimalMax(value = "100.0", message = "Radius cannot exceed 100 km")
    private Double radius;

    // City search
    @Size(max = 100, message = "City name too long")
    private String city;

    // Cuisine filtering
    @Size(max = 50, message = "Cuisine type too long")
    private String cuisineType; // Indian, Chinese, Italian, etc.

    // Food category filtering
    @Size(max = 50, message = "Food category too long")
    private String foodCategory; // Veg, Non-Veg, Cafe, Fast Food, Fine Dining

    // Price range filtering
    @DecimalMin(value = "0.0", message = "Minimum price must be non-negative")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "Maximum price must be non-negative")
    private BigDecimal maxPrice;

    // Rating filtering
    @DecimalMin(value = "0.0", message = "Minimum rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Minimum rating must be between 0 and 5")
    private BigDecimal minRating;

    // Active only filter
    @lombok.Builder.Default
    private Boolean activeOnly = true;

    // Pagination
    @Min(value = 0, message = "Page number must be non-negative")
    @lombok.Builder.Default
    private Integer page = 0;

    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    @lombok.Builder.Default
    private Integer size = 20;

    // Sorting
    @lombok.Builder.Default
    private String sort = "distance"; // distance, rating, popularity, price
}
