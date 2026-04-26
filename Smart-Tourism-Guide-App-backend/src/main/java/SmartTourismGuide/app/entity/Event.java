package SmartTourismGuide.app.entity;

import SmartTourismGuide.app.enums.EventCategory;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_event_date", columnList = "event_date"),
        @Index(name = "idx_city", columnList = "city"),
        @Index(name = "idx_deleted", columnList = "deleted"),
        @Index(name = "idx_category", columnList = "category"),
        @Index(name = "idx_composite", columnList = "deleted, event_date, city")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private EventCategory category;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "event_time")
    private LocalTime eventTime;

    @Column(nullable = false, length = 100)
    private String city;

    private String venue;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "organizer_name")
    private String organizerName;

    @Column(name = "organizer_contact", length = 100)
    private String organizerContact;

    @Column(name = "ticket_info", columnDefinition = "TEXT")
    private String ticketInfo;

    @Column(name = "entry_fee", precision = 10, scale = 2)
    private BigDecimal entryFee;

    @Column(name = "is_free")
    @lombok.Builder.Default
    private Boolean isFree = false;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventImage> images = new ArrayList<>();

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean deleted = false;

    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean verified = true;
    @Column(name = "submitted_by_user_id")
    private Long submittedByUserId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
