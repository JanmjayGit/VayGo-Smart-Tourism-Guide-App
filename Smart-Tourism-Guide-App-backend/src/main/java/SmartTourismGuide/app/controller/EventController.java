package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreateEventRequest;
import SmartTourismGuide.app.dto.response.EventDto;
import SmartTourismGuide.app.dto.response.EventSummaryDto;
import SmartTourismGuide.app.enums.EventCategory;
import SmartTourismGuide.app.security.services.UserDetailsImpl;
import SmartTourismGuide.app.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        log.info("Fetching event details for id: {}", id);
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @GetMapping
    public ResponseEntity<Page<EventSummaryDto>> searchEvents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Searching events with filters - city: {}, category: {}, startDate: {}, endDate: {}",
                city, category, startDate, endDate);

        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").ascending());
        Page<EventSummaryDto> events = eventService.searchEvents(city, category, startDate, endDate, pageable);

        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Page<EventSummaryDto>> getUpcomingEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching upcoming events");

        Pageable pageable = PageRequest.of(page, size);
        Page<EventSummaryDto> events = eventService.getUpcomingEvents(pageable);

        return ResponseEntity.ok(events);
    }

    @GetMapping("/current")
    public ResponseEntity<Page<EventSummaryDto>> getCurrentEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching current events");

        Pageable pageable = PageRequest.of(page, size);
        Page<EventSummaryDto> events = eventService.getCurrentEvents(pageable);

        return ResponseEntity.ok(events);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<Page<EventSummaryDto>> getEventsByCity(
            @PathVariable String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching events for city: {}", city);

        Pageable pageable = PageRequest.of(page, size);
        Page<EventSummaryDto> events = eventService.getEventsByCity(city, pageable);

        return ResponseEntity.ok(events);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<EventSummaryDto>> getEventsByCategory(
            @PathVariable EventCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching events for category: {}", category);

        Pageable pageable = PageRequest.of(page, size);
        Page<EventSummaryDto> events = eventService.getEventsByCategory(category, pageable);

        return ResponseEntity.ok(events);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<EventSummaryDto>> getNearbyEvents(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "10.0") Double radius,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching events near coordinates: lat={}, lon={}, radius={}km", lat, lon, radius);

        Pageable pageable = PageRequest.of(page, size);
        Page<EventSummaryDto> events = eventService.getNearbyEvents(lat, lon, radius, pageable);

        return ResponseEntity.ok(events);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<EventSummaryDto>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching events between {} and {}", startDate, endDate);

        Pageable pageable = PageRequest.of(page, size);
        Page<EventSummaryDto> events = eventService.getEventsByDateRange(startDate, endDate, pageable);

        return ResponseEntity.ok(events);
    }

    // ── User submission ────────────────────────────────────────────────────

    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventDto> submitEvent(
            @Valid @RequestBody CreateEventRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("User {} submitting event: {}", userDetails.getId(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.submitEvent(userDetails.getId(), request));
    }
}
