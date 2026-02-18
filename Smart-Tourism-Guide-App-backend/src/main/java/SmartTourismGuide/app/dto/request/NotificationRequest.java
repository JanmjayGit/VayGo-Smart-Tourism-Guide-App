package SmartTourismGuide.app.dto.request;

import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Priority is required")
    private NotificationPriority priority;

    private Long userId; // NULL for broadcast

    private String locationCity; // For location-based notifications

    private Map<String, Object> data; // Additional metadata
}
