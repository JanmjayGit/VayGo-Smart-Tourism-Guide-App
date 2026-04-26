package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.request.NotificationRequest;
import SmartTourismGuide.app.dto.response.NotificationDto;
import SmartTourismGuide.app.dto.response.NotificationPreferenceDto;
import SmartTourismGuide.app.entity.Notification;
import SmartTourismGuide.app.entity.UserNotificationPreference;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationMapper {


    // Convert Notification entity to DTO
    public NotificationDto toDto(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .priority(notification.getPriority())
                .data(notification.getData())
                .isRead(notification.getIsRead())
                .sentAt(notification.getSentAt())
                .expiresAt(notification.getExpiresAt())
                .build();
    }


     // Convert NotificationRequest to Notification entity
    public Notification toEntity(NotificationRequest request) {
        if (request == null) {
            return null;
        }

        return Notification.builder()
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .priority(request.getPriority())
                .userId(request.getUserId())
                .locationCity(request.getLocationCity())
                .data(request.getData())
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30)) // Default 30 days expiration
                .build();
    }


     // Convert UserNotificationPreference entity to DTO
    public NotificationPreferenceDto toPreferenceDto(UserNotificationPreference preference) {
        if (preference == null) {
            return null;
        }

        return NotificationPreferenceDto.builder()
                .id(preference.getId())
                .enableEventAlerts(preference.getEnableEventAlerts())
                .enableWeatherAlerts(preference.getEnableWeatherAlerts())
                .enableEmergencyAlerts(preference.getEnableEmergencyAlerts())
                .enableRecommendationAlerts(preference.getEnableRecommendationAlerts())
                .preferredCities(preference.getPreferredCities())
                .notificationRadiusKm(preference.getNotificationRadiusKm())
                .quietHoursStart(preference.getQuietHoursStart())
                .quietHoursEnd(preference.getQuietHoursEnd())
                .build();
    }


    // Update UserNotificationPreference entity from DTO
    public void updatePreferenceFromDto(UserNotificationPreference preference, NotificationPreferenceDto dto) {
        if (preference == null || dto == null) {
            return;
        }

        if (dto.getEnableEventAlerts() != null) {
            preference.setEnableEventAlerts(dto.getEnableEventAlerts());
        }
        if (dto.getEnableWeatherAlerts() != null) {
            preference.setEnableWeatherAlerts(dto.getEnableWeatherAlerts());
        }
        if (dto.getEnableEmergencyAlerts() != null) {
            preference.setEnableEmergencyAlerts(dto.getEnableEmergencyAlerts());
        }
        if (dto.getEnableRecommendationAlerts() != null) {
            preference.setEnableRecommendationAlerts(dto.getEnableRecommendationAlerts());
        }
        if (dto.getPreferredCities() != null) {
            preference.setPreferredCities(dto.getPreferredCities());
        }
        if (dto.getNotificationRadiusKm() != null) {
            preference.setNotificationRadiusKm(dto.getNotificationRadiusKm());
        }
        if (dto.getQuietHoursStart() != null) {
            preference.setQuietHoursStart(dto.getQuietHoursStart());
        }
        if (dto.getQuietHoursEnd() != null) {
            preference.setQuietHoursEnd(dto.getQuietHoursEnd());
        }
    }
}
