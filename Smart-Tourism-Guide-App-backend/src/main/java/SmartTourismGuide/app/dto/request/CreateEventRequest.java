package SmartTourismGuide.app.dto.request;

import SmartTourismGuide.app.enums.EventCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {

    @NotBlank(message = "Event name is required")
    @Size(max = 255, message = "Event name must not exceed 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Event category is required")
    private EventCategory category;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date must be today or in the future")
    private LocalDate eventDate;

    private LocalDate endDate;

    private LocalTime eventTime;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name must not exceed 100 characters")
    private String city;

    @Size(max = 255, message = "Venue must not exceed 255 characters")
    private String venue;

    private String address;

    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
    private BigDecimal longitude;

    @Size(max = 255, message = "Organizer name must not exceed 255 characters")
    private String organizerName;

    @Size(max = 100, message = "Organizer contact must not exceed 100 characters")
    private String organizerContact;

    private String ticketInfo;

    @DecimalMin(value = "0.0", message = "Entry fee must be >= 0")
    private BigDecimal entryFee;

    @lombok.Builder.Default
    private Boolean isFree = false;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    private List<String> imageUrls;

    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    private String websiteUrl;
}
