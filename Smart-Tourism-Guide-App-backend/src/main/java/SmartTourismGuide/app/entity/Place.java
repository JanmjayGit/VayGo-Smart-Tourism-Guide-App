package SmartTourismGuide.app.entity;

import SmartTourismGuide.app.enums.PlaceCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "places", indexes = {
        @Index(name = "idx_location", columnList = "latitude, longitude"),
        @Index(name = "idx_category", columnList = "category"),
        @Index(name = "idx_rating", columnList = "rating"),
        @Index(name = "idx_popularity", columnList = "popularity"),
        @Index(name = "idx_deleted_category", columnList = "deleted, category"),
        @Index(name = "idx_city_category", columnList = "city, deleted, category"),
        @Index(name = "idx_price_category", columnList = "price_per_night, deleted, category"),
        @Index(name = "idx_rating_category", columnList = "rating, category, deleted"),
        // Restaurant-specific indexes
        @Index(name = "idx_cuisine_category", columnList = "cuisine_type, deleted, category"),
        @Index(name = "idx_food_category", columnList = "food_category, deleted, category"),
        @Index(name = "idx_city_cuisine", columnList = "city, cuisine_type, deleted")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PlaceCategory category;

    @NotNull
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Column(precision = 10, scale = 8, nullable = false)
    private BigDecimal latitude;

    @NotNull
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Column(precision = 11, scale = 8, nullable = false)
    private BigDecimal longitude;

    @Size(max = 500)
    private String address;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Min(0)
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long popularity = 0L;

    @Size(max = 500)
    private String imageUrl;

    @Size(max = 100)
    private String contactInfo;

    @Column(columnDefinition = "TEXT")
    private String openingHours; // JSON format: {"monday": "9:00-18:00", ...}

    @Min(1)
    @Max(4)
    private Integer priceRange; // 1 = Budget, 2 = Moderate, 3 = Expensive, 4 = Luxury

    // Hotel-specific fields
    @DecimalMin(value = "0.0", message = "Price per night must be positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerNight; // Hotel price per night

    @Size(max = 100)
    private String city; // City for location-based search

    @Column(columnDefinition = "TEXT")
    private String amenities; // JSON array: ["WiFi", "Parking", "Pool"]

    @Column(nullable = false)
    private Boolean availabilityStatus = true; // Is hotel accepting bookings?

    // Restaurant-specific fields
    @Size(max = 50)
    @Column(length = 50)
    private String cuisineType; // Indian, Chinese, Italian, Mexican, Thai, etc.

    @Size(max = 50)
    @Column(length = 50)
    private String foodCategory; // Veg, Non-Veg, Cafe, Fast Food, Fine Dining

    @Column(columnDefinition = "TEXT")
    private String popularDishes; // JSON array: ["Biryani", "Butter Chicken", "Naan"]

    // Soft delete fields
    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
