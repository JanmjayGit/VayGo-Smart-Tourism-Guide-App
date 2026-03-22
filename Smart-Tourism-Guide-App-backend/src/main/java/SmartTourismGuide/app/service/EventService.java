package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.CreateEventRequest;
import SmartTourismGuide.app.dto.request.UpdateEventRequest;
import SmartTourismGuide.app.dto.response.EventDto;
import SmartTourismGuide.app.dto.response.EventSummaryDto;
import SmartTourismGuide.app.enums.EventCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface EventService {

    EventDto createEvent(CreateEventRequest request);

    EventDto updateEvent(Long id, UpdateEventRequest request);

    void deleteEvent(Long id);

    void restoreEvent(Long id);

    Page<EventSummaryDto> getUpcomingEvents(Pageable pageable);

    Page<EventSummaryDto> getCurrentEvents(Pageable pageable);

    Page<EventSummaryDto> getEventsByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<EventSummaryDto> getEventsByCity(String city, Pageable pageable);

    Page<EventSummaryDto> getEventsByCategory(EventCategory category, Pageable pageable);

    Page<EventSummaryDto> getNearbyEvents(Double lat, Double lon, Double radiusKm, Pageable pageable);

    Page<EventSummaryDto> searchEvents(String city, EventCategory category, LocalDate startDate, LocalDate endDate,
            Pageable pageable);

    EventDto getEventById(Long id);

    // ── User submission & admin moderation ───────────────────────────────────
    EventDto submitEvent(Long userId, CreateEventRequest request);

    Page<EventDto> getPendingEvents(int page, int size);

    EventDto verifyEvent(Long id);

    void rejectEvent(Long id);
}
