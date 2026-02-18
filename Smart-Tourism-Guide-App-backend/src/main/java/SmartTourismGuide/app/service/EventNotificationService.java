package SmartTourismGuide.app.service;

import SmartTourismGuide.app.entity.Event;

public interface EventNotificationService {

    void notifyNewEvent(Event event);
    void notifyEventUpdate(Event event);
    void notifyEventCancellation(Event event);
    void sendEventReminders();
    void sendEventStartingSoonReminders();
}
