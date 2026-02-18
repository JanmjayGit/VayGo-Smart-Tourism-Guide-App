package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.response.NotificationDto;
import SmartTourismGuide.app.dto.response.NotificationPreferenceDto;
import SmartTourismGuide.app.entity.Notification;
import SmartTourismGuide.app.entity.UserNotificationPreference;
import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.NotificationMapper;
import SmartTourismGuide.app.repository.FavoriteRepository;
import SmartTourismGuide.app.repository.NotificationRepository;
import SmartTourismGuide.app.repository.UserNotificationPreferenceRepository;
import SmartTourismGuide.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final FavoriteRepository favoriteRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendBroadcast(NotificationType type, String title, String message, NotificationPriority priority) {
        log.info("Sending broadcast notification: type={}, title={}", type, title);

        NotificationDto notification = NotificationDto.builder()
                .type(type)
                .title(title)
                .message(message)
                .priority(priority)
                .sentAt(LocalDateTime.now())
                .build();

        // Send to WebSocket topic
        messagingTemplate.convertAndSend("/topic/" + type.name().toLowerCase(), notification);

        // Persist for offline users (critical notifications only)
        if (priority == NotificationPriority.CRITICAL || priority == NotificationPriority.HIGH) {
            persistNotification(notification);
        }
    }

    @Override
    public void sendToUser(Long userId, NotificationDto notification) {
        log.info("Sending notification to user {}: {}", userId, notification.getTitle());

        // Check user preferences
        if (!shouldSendNotification(userId, notification.getType())) {
            log.debug("Notification blocked by user preferences: userId={}, type={}", userId, notification.getType());
            return;
        }

        // Check quiet hours
        if (isQuietHours(userId)) {
            log.debug("User in quiet hours, persisting notification: userId={}", userId);
            persistNotification(notification);
            return;
        }

        // Send to user-specific queue
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/personal",
                notification);

        // Always persist user-specific notifications
        persistNotification(notification);
    }

    @Override
    public void sendToLocation(String city, NotificationType type, String title, String message,
            NotificationPriority priority) {
        log.info("Sending location-based notification: city={}, type={}", city, type);

        NotificationDto notification = NotificationDto.builder()
                .type(type)
                .title(title)
                .message(message)
                .priority(priority)
                .sentAt(LocalDateTime.now())
                .data(Map.of("city", city))
                .build();

        // Send to location-specific topic
        messagingTemplate.convertAndSend("/topic/location/" + city.toLowerCase(), notification);

        // Persist with location
        Notification entity = Notification.builder()
                .type(type)
                .title(title)
                .message(message)
                .priority(priority)
                .locationCity(city)
                .data(Map.of("city", city))
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        notificationRepository.save(entity);
    }

    @Override
    public void sendToEventSubscribers(Long eventId, String title, String message) {
        log.info("Sending notification to event subscribers: eventId={}", eventId);

        // Get users who favorited this event
        List<Long> subscribedUserIds = favoriteRepository.findUserIdsByPlaceId(eventId);

        NotificationDto notification = NotificationDto.builder()
                .type(NotificationType.EVENT_ALERT)
                .title(title)
                .message(message)
                .priority(NotificationPriority.MEDIUM)
                .data(Map.of("eventId", eventId))
                .sentAt(LocalDateTime.now())
                .build();

        // Send to each subscribed user
        for (Long userId : subscribedUserIds) {
            sendToUser(userId, notification);
        }
    }

    @Override
    @Transactional
    public void persistNotification(NotificationDto notificationDto) {
        Notification notification = Notification.builder()
                .type(notificationDto.getType())
                .title(notificationDto.getTitle())
                .message(notificationDto.getMessage())
                .priority(notificationDto.getPriority())
                .userId(notificationDto.getId()) // Set if user-specific
                .data(notificationDto.getData())
                .isRead(false)
                .sentAt(notificationDto.getSentAt() != null ? notificationDto.getSentAt() : LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        notificationRepository.save(notification);
        log.debug("Notification persisted: id={}", notification.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderBySentAtDesc(userId, pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUnreadNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderBySentAtDesc(userId,
                pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
        log.debug("Notification marked as read: id={}, userId={}", notificationId, userId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        int updated = notificationRepository.markAllAsRead(userId);
        log.info("Marked {} notifications as read for user {}", updated, userId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getUserId() != null && !notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Access denied");
        }

        notificationRepository.delete(notification);
        log.debug("Notification deleted: id={}, userId={}", notificationId, userId);
    }

    @Override
    @Transactional
    public NotificationPreferenceDto getUserPreferences(Long userId) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return notificationMapper.toPreferenceDto(preference);
    }

    @Override
    @Transactional
    public NotificationPreferenceDto updateUserPreferences(Long userId, NotificationPreferenceDto preferencesDto) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        notificationMapper.updatePreferenceFromDto(preference, preferencesDto);
        UserNotificationPreference saved = preferenceRepository.save(preference);

        log.info("Updated notification preferences for user {}", userId);
        return notificationMapper.toPreferenceDto(saved);
    }

    @Override
    @Scheduled(cron = "0 0 2 * * *") // Run daily at 2 AM
    @Transactional
    public void cleanupExpiredNotifications() {
        LocalDateTime now = LocalDateTime.now();
        int deletedExpired = notificationRepository.deleteExpiredNotifications(now);

        // Also delete old notifications (older than 30 days)
        LocalDateTime cutoffDate = now.minusDays(30);
        int deletedOld = notificationRepository.deleteOldNotifications(cutoffDate);

        log.info("Cleaned up notifications: {} expired, {} old", deletedExpired, deletedOld);
    }

    private boolean shouldSendNotification(Long userId, NotificationType type) {
        return preferenceRepository.findByUserId(userId)
                .map(pref -> {
                    return switch (type) {
                        case EVENT_ALERT -> pref.getEnableEventAlerts();
                        case WEATHER_ALERT -> pref.getEnableWeatherAlerts();
                        case EMERGENCY_ALERT -> pref.getEnableEmergencyAlerts();
                        case RECOMMENDATION -> pref.getEnableRecommendationAlerts();
                    };
                })
                .orElse(true); // Default to true if no preferences set
    }

    private boolean isQuietHours(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .map(pref -> {
                    if (pref.getQuietHoursStart() == null || pref.getQuietHoursEnd() == null) {
                        return false;
                    }

                    LocalTime now = LocalTime.now();
                    LocalTime start = pref.getQuietHoursStart();
                    LocalTime end = pref.getQuietHoursEnd();

                    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
                    if (start.isAfter(end)) {
                        return now.isAfter(start) || now.isBefore(end);
                    } else {
                        return now.isAfter(start) && now.isBefore(end);
                    }
                })
                .orElse(false);
    }

    private UserNotificationPreference createDefaultPreferences(Long userId) {
        UserNotificationPreference preference = UserNotificationPreference.builder()
                .userId(userId)
                .enableEventAlerts(true)
                .enableWeatherAlerts(true)
                .enableEmergencyAlerts(true)
                .enableRecommendationAlerts(true)
                .notificationRadiusKm(10)
                .build();

        return preferenceRepository.save(preference);
    }
}
