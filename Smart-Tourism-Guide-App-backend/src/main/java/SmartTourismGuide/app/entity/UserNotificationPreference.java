package SmartTourismGuide.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_notification_preferences")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // Notification type preferences
    @Column(name = "enable_event_alerts")
    @lombok.Builder.Default
    private Boolean enableEventAlerts = true;

    @Column(name = "enable_weather_alerts")
    @lombok.Builder.Default
    private Boolean enableWeatherAlerts = true;

    @Column(name = "enable_emergency_alerts")
    @lombok.Builder.Default
    private Boolean enableEmergencyAlerts = true;

    @Column(name = "enable_recommendation_alerts")
    @lombok.Builder.Default
    private Boolean enableRecommendationAlerts = true;

    // Location preferences (cities of interest)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferred_cities", columnDefinition = "json")
    private List<String> preferredCities;

    @Column(name = "notification_radius_km")
    @lombok.Builder.Default
    private Integer notificationRadiusKm = 10;

    // Quiet hours (no notifications during this time)
    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart;

    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
