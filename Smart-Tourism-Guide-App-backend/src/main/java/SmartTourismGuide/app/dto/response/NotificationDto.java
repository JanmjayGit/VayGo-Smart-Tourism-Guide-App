package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private NotificationPriority priority;
    private Map<String, Object> data;
    private Boolean isRead;
    private LocalDateTime sentAt;
    private LocalDateTime expiresAt;
}
