package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.EventCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    private EventCategory category;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String city;
    private String venue;
    private String address;
    private Double latitude;
    private Double longitude;
    private String organizerName;
    private String organizerContact;
    private String ticketInfo;
    private BigDecimal entryFee;
    private Boolean isFree;
    private String imageUrl;
    private String websiteUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
