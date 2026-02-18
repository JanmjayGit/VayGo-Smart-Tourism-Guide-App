package SmartTourismGuide.app.service;

import SmartTourismGuide.app.enums.NotificationPriority;

public interface EmergencyNotificationService {

    void broadcastEmergency(String title, String message);
    void notifyLocationEmergency(String city, String title, String message);
    void sendEmergencyAlert(String city, String title, String message, NotificationPriority priority);
}
