package SmartTourismGuide.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotels", indexes = {
        @Index(name = "idx_hotel_location", columnList = "latitude, longitude"),
        @Index(name = "idx_hotel_city", columnList = "city"),
        @Index(name = "idx_hotel_verified_deleted", columnList = "verified, deleted"),
        @Index(name = "idx_hotel_price", columnList = "price_per_night")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 100)
    private String city;

    @Size(max = 500)
    private String address;

    @Size(max = 100)
    private String contactInfo;

    @Column(columnDefinition = "TEXT")
    private String openingHours;

    // Budget level as a label e.g. "Budget" / "Mid-range" / "Luxury"
    @Size(max = 50)
    private String priceRange;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Column(precision = 10, scale = 8, nullable = false)
    private BigDecimal latitude = BigDecimal.ZERO;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Column(precision = 11, scale = 8, nullable = false)
    private BigDecimal longitude = BigDecimal.ZERO;

    // Primary / hero image
    @Size(max = 500)
    @Column(name = "image_url")
    private String imageUrl;

    // Gallery images — stored in a separate join table
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hotel_images", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "image_url", length = 1000)
    private List<String> imageUrls = new ArrayList<>();

    // JSON array e.g. ["WiFi","Parking","Pool"]
    @Column(columnDefinition = "TEXT")
    private String amenities;

    @DecimalMin(value = "0.0")
    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(nullable = false)
    private Boolean availabilityStatus = true;

    // true = visible publicly; false = awaiting admin approval
    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private Boolean deleted = false;

    // null means admin created; non-null means user-submitted
    private Long submittedByUserId;

    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long popularity = 0L;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;
}
