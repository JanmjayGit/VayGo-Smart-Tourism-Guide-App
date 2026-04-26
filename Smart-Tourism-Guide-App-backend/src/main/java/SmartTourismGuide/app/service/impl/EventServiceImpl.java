package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.CreateEventRequest;
import SmartTourismGuide.app.dto.request.UpdateEventRequest;
import SmartTourismGuide.app.dto.response.EventDto;
import SmartTourismGuide.app.dto.response.EventSummaryDto;
import SmartTourismGuide.app.entity.Event;
import SmartTourismGuide.app.entity.EventImage;
import SmartTourismGuide.app.enums.EventCategory;
import SmartTourismGuide.app.exceptions.EventNotFoundException;
import SmartTourismGuide.app.exceptions.InvalidDateRangeException;
import SmartTourismGuide.app.mapper.EventMapper;
import SmartTourismGuide.app.repository.EventRepository;
import SmartTourismGuide.app.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public EventDto createEvent(CreateEventRequest request) {
        log.info("Creating new event: {}", request.getName());

        Event event = eventMapper.toEntity(request);

        if (request.getImageUrls() != null) {
            request.getImageUrls().forEach(url -> {
                EventImage img = EventImage.builder()
                        .imageUrl(url)
                        .event(event)
                        .build();
                event.getImages().add(img);
            });
        }

        Event savedEvent = eventRepository.save(event);

        log.info("Event created successfully with id: {}", savedEvent.getId());
        return eventMapper.toDto(savedEvent);
    }

    @Override
    @Transactional
    public EventDto updateEvent(Long id, UpdateEventRequest request) {

        log.info("Updating event with id: {}", id);

        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        // update normal fields
        eventMapper.updateEntity(event, request);

        // Update gallery images
        if (request.getImageUrls() != null) {

            // remove old images
            event.getImages().clear();

            // add new images
            request.getImageUrls().forEach(url -> {

                EventImage img = EventImage.builder()
                        .imageUrl(url)
                        .event(event)
                        .build();

                event.getImages().add(img);
            });

            // set primary image
            if (!request.getImageUrls().isEmpty()) {
                event.setImageUrl(request.getImageUrls().get(0));
            }
        }

        Event updatedEvent = eventRepository.save(event);

        log.info("Event updated successfully: {}", id);

        return eventMapper.toDto(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        log.info("Soft deleting event with id: {}", id);

        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        event.setDeleted(true);
        eventRepository.save(event);

        log.info("Event soft deleted successfully: {}", id);
    }

    @Override
    @Transactional
    public void restoreEvent(Long id) {
        log.info("Restoring event with id: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        if (!event.getDeleted()) {
            log.warn("Event {} is not deleted, no action needed", id);
            return;
        }

        event.setDeleted(false);
        eventRepository.save(event);

        log.info("Event restored successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> getUpcomingEvents(Pageable pageable) {
        log.info("Fetching upcoming events");

        LocalDate today = LocalDate.now();
        Page<Event> events = eventRepository.findUpcomingEvents(today, pageable);

        return events.map(eventMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> getCurrentEvents(Pageable pageable) {
        log.info("Fetching current events");

        LocalDate today = LocalDate.now();
        Page<Event> events = eventRepository.findCurrentEvents(today, pageable);

        return events.map(eventMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> getEventsByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.info("Fetching events between {} and {}", startDate, endDate);

        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date must be before or equal to end date");
        }

        Page<Event> events = eventRepository.findEventsByDateRange(startDate, endDate, pageable);

        return events.map(eventMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> getEventsByCity(String city, Pageable pageable) {
        log.info("Fetching events for city: {}", city);

        LocalDate today = LocalDate.now();
        Page<Event> events = eventRepository.findEventsByCity(city, today, pageable);

        return events.map(eventMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> getEventsByCategory(EventCategory category, Pageable pageable) {
        log.info("Fetching events for category: {}", category);

        LocalDate today = LocalDate.now();
        Page<Event> events = eventRepository.findEventsByCategory(category, today, pageable);

        return events.map(eventMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> getNearbyEvents(Double lat, Double lon, Double radiusKm, Pageable pageable) {
        log.info("Fetching events near coordinates: lat={}, lon={}, radius={}km", lat, lon, radiusKm);

        if (lat < -90 || lat > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (lon < -180 || lon > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (radiusKm <= 0) {
            throw new IllegalArgumentException("Radius must be greater than 0");
        }

        LocalDate today = LocalDate.now();
        List<Event> events = eventRepository.findNearbyEvents(lat, lon, radiusKm, today);

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), events.size());

        List<EventSummaryDto> pagedEvents = events.subList(start, end)
                .stream()
                .map(e -> eventMapper.toSummaryDto(e))
                .toList();

        return new org.springframework.data.domain.PageImpl<>(
                pagedEvents,
                pageable,
                events.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryDto> searchEvents(String city, EventCategory category, LocalDate startDate,
            LocalDate endDate, Pageable pageable) {
        log.info("Searching events with filters - city: {}, category: {}, startDate: {}, endDate: {}",
                city, category, startDate, endDate);

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date must be before or equal to end date");
        }

        Page<Event> events = eventRepository.searchEvents(city, category, startDate, endDate, pageable);

        return events.map(eventMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public EventDto getEventById(Long id) {
        log.info("Fetching event with id: {}", id);

        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        return eventMapper.toDto(event);
    }

    // ── User submission & admin moderation ───────────────────────────────────

    @Override
    @Transactional
    public EventDto submitEvent(Long userId, CreateEventRequest request) {

        log.info("User {} submitting event: {}", userId, request.getName());

        Event event = eventMapper.toEntity(request);

        // Save gallery images
        if (request.getImageUrls() != null) {
            request.getImageUrls().forEach(url -> {
                EventImage img = EventImage.builder()
                        .imageUrl(url)
                        .event(event)
                        .build();

                event.getImages().add(img);
            });
        }

        event.setVerified(false);
        event.setSubmittedByUserId(userId);

        Event saved = eventRepository.save(event);

        return eventMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventDto> getPendingEvents(int page, int size) {
        log.info("Fetching pending events — page {}", page);
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return eventRepository.findPendingEvents(pageable).map(eventMapper::toDto);
    }

    @Override
    @Transactional
    public EventDto verifyEvent(Long id) {
        log.info("Verifying event id: {}", id);
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setVerified(true);
        return eventMapper.toDto(eventRepository.save(event));
    }

    @Override
    @Transactional
    public void rejectEvent(Long id) {
        log.info("Rejecting event id: {}", id);
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setDeleted(true);
        eventRepository.save(event);
    }

    /** Hindi + English stop words to ignore during keyword extraction */
    private static final Set<String> STOP_WORDS = Set.of(
            "wali", "wala", "wale", "ka", "ke", "ki", "ko", "se", "mein", "par",
            "aur", "ya", "the", "a", "an", "of", "in", "at", "on", "and", "or",
            "for", "to", "with", "by", "is", "are", "was", "be", "as");

    /**
     * Extract meaningful keywords from an event name.
     * "Phoolon wali Holi" → ["phoolon", "holi"]
     */
    private Set<String> extractKeywords(String name) {
        if (name == null || name.isBlank())
            return Collections.emptySet();
        return Arrays.stream(name.toLowerCase().split("[\\s\\-_,./]+"))
                .map(String::trim)
                .filter(w -> w.length() > 2) // skip very short words
                .filter(w -> !STOP_WORDS.contains(w)) // remove stop words
                .collect(Collectors.toSet());
    }

    // ── User: fetch own event submissions ────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<EventDto> getUserEvents(Long userId) {
        log.info("Fetching events submitted by user: {}", userId);
        return eventRepository
                .findBySubmittedByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

    // ── User: edit own PENDING event ─────────────────────────────────────────
    @Override
    @Transactional
    public EventDto userEditEvent(Long eventId, Long userId, CreateEventRequest request) {
        log.info("User {} editing event {}", userId, eventId);

        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (!userId.equals(event.getSubmittedByUserId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only edit your own submissions");
        }
        if (event.getVerified()) {
            throw new IllegalStateException("Cannot edit an already-approved event");
        }

        if (request.getName() != null)        event.setName(request.getName());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getCity() != null)        event.setCity(request.getCity());
        if (request.getImageUrl() != null)    event.setImageUrl(request.getImageUrl());
        if (request.getVenue() != null)       event.setVenue(request.getVenue());

        return eventMapper.toDto(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryDto> getSimilarEvents(Long eventId, int limit) {
        log.info("Finding similar events for eventId: {}", eventId);

        Event source = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        LocalDate today = LocalDate.now();
        Set<String> sourceKeywords = extractKeywords(source.getName());

        // Candidate pool = same-category events ONLY.
        // Cross-category keyword matches are intentionally excluded —
        // a CONCERT viewer must never see SPORTS events.
        List<Event> candidates = eventRepository
                .findSimilarByCategory(eventId, source.getCategory(), today);

        // Re-rank within same-category pool using keyword overlap.
        // score 3 = category + keyword match  (shown first)
        // score 1 = category only             (shown after)
        return candidates.stream()
                .map(candidate -> {
                    Set<String> candidateKw = extractKeywords(candidate.getName());
                    boolean hasCommonKeyword = !Collections.disjoint(candidateKw, sourceKeywords);
                    int score = hasCommonKeyword ? 3 : 1;
                    return Map.entry(candidate, score);
                })
                .sorted(Map.Entry.<Event, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(e -> eventMapper.toSummaryDto(e.getKey()))
                .collect(Collectors.toList());
    }
}
