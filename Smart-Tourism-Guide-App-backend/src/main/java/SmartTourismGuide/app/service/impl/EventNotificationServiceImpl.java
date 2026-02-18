package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.entity.Event;
import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.enums.NotificationType;
import SmartTourismGuide.app.repository.EventRepository;
import SmartTourismGuide.app.service.EventNotificationService;
import SmartTourismGuide.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventNotificationServiceImpl implements EventNotificationService {

    private final NotificationService notificationService;
    private final EventRepository eventRepository;

    @Override
    public void notifyNewEvent(Event event) {
        log.info("Sending new event notification: eventId={}, name={}", event.getId(), event.getName());

        String title = "New Event: " + event.getName();
        String message = String.format(
                "A new %s event is happening in %s on %s. Check it out!",
                event.getCategory().name().toLowerCase(),
                event.getCity(),
                event.getEventDate());

        notificationService.sendToLocation(
                event.getCity(),
                NotificationType.EVENT_ALERT,
                title,
                message,
                NotificationPriority.MEDIUM);
    }

    @Override
    public void notifyEventUpdate(Event event) {
        log.info("Sending event update notification: eventId={}", event.getId());

        String title = "Event Updated: " + event.getName();
        String message = "An event you're interested in has been updated. Check the latest details!";

        notificationService.sendToEventSubscribers(event.getId(), title, message);
    }

    @Override
    public void notifyEventCancellation(Event event) {
        log.info("Sending event cancellation notification: eventId={}", event.getId());

        String title = "Event Cancelled: " + event.getName();
        String message = String.format(
                "Unfortunately, the event scheduled for %s in %s has been cancelled.",
                event.getEventDate(),
                event.getCity());

        notificationService.sendToEventSubscribers(event.getId(), title, message);
    }

    @Override
    @Scheduled(cron = "0 0 9 * * *")
    public void sendEventReminders() {
        log.info("Running scheduled event reminder task");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Event> upcomingEvents = eventRepository.findByEventDate(tomorrow);

        log.info("Found {} events happening tomorrow", upcomingEvents.size());

        for (Event event : upcomingEvents) {
            String title = "Event Tomorrow: " + event.getName();
            String message = String.format(
                    "Don't forget! %s is happening tomorrow at %s in %s.",
                    event.getName(),
                    event.getEventTime() != null ? event.getEventTime() : "TBD",
                    event.getVenue());

            notificationService.sendToEventSubscribers(event.getId(), title, message);
        }
    }

    @Override
    @Scheduled(cron = "0 0 * * * *")
    public void sendEventStartingSoonReminders() {
        LocalDateTime oneHourFromNow = LocalDateTime.now().plusHours(1);
        LocalDate today = LocalDate.now();

        // Find events happening today
        List<Event> todayEvents = eventRepository.findByEventDate(today);

        for (Event event : todayEvents) {
            if (event.getEventTime() != null) {
                LocalDateTime eventDateTime = LocalDateTime.of(event.getEventDate(), event.getEventTime());

                // Check if event starts in approximately 1 hour (within 5 minute window)
                if (eventDateTime.isAfter(oneHourFromNow.minusMinutes(5)) &&
                        eventDateTime.isBefore(oneHourFromNow.plusMinutes(5))) {

                    String title = "Event Starting Soon: " + event.getName();
                    String message = String.format(
                            "%s starts in 1 hour at %s. Get ready!",
                            event.getName(),
                            event.getVenue());

                    notificationService.sendToEventSubscribers(event.getId(), title, message);
                    log.info("Sent 1-hour reminder for event: {}", event.getName());
                }
            }
        }
    }
}
