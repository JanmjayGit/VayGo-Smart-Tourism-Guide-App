package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.NotificationDto;
import SmartTourismGuide.app.dto.response.NotificationPreferenceDto;
import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {


    void sendBroadcast(NotificationType type, String title, String message, NotificationPriority priority);
    void sendToUser(Long userId, NotificationDto notification);
    void sendToLocation(String city, NotificationType type, String title, String message,
            NotificationPriority priority);


    void sendToEventSubscribers(Long eventId, String title, String message);
    void persistNotification(NotificationDto notification);
    Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable);
    Page<NotificationDto> getUnreadNotifications(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId, Long userId);
    NotificationPreferenceDto getUserPreferences(Long userId);
    NotificationPreferenceDto updateUserPreferences(Long userId, NotificationPreferenceDto preferences);
    void cleanupExpiredNotifications();
}
