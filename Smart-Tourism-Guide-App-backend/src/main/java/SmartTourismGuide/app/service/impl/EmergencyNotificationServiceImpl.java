package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import SmartTourismGuide.app.service.EmergencyNotificationService;
import SmartTourismGuide.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyNotificationServiceImpl implements EmergencyNotificationService {

    private final NotificationService notificationService;

    @Override
    public void broadcastEmergency(String title, String message) {
        log.warn("Broadcasting emergency alert: {}", title);

        notificationService.sendBroadcast(
                NotificationType.EMERGENCY_ALERT,
                title,
                message,
                NotificationPriority.CRITICAL);

        log.info("Emergency broadcast sent successfully");
    }

    @Override
    public void notifyLocationEmergency(String city, String title, String message) {
        log.warn("Sending location-based emergency alert for city: {}", city);

        notificationService.sendToLocation(
                city,
                NotificationType.EMERGENCY_ALERT,
                title,
                message,
                NotificationPriority.CRITICAL);

        log.info("Location-based emergency alert sent to {}", city);
    }

    @Override
    public void sendEmergencyAlert(
            String city, String title, String message, NotificationPriority priority) {

        log.warn("Sending emergency alert: city={}, priority={}", city, priority);

        if (city != null && !city.trim().isEmpty()) {
            notificationService.sendToLocation(
                    city,
                    NotificationType.EMERGENCY_ALERT,
                    title,
                    message,
                    priority);
        } else {
            notificationService.sendBroadcast(
                    NotificationType.EMERGENCY_ALERT,
                    title,
                    message,
                    priority);
        }

        log.info("Emergency alert sent successfully");
    }
}
