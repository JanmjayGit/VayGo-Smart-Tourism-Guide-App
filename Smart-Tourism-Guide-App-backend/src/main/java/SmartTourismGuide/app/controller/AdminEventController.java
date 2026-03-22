package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreateEventRequest;
import SmartTourismGuide.app.dto.request.UpdateEventRequest;
import SmartTourismGuide.app.dto.response.EventDto;
import SmartTourismGuide.app.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody CreateEventRequest request) {
        log.info("Admin creating event: {}", request.getName());
        EventDto createdEvent = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request) {
        log.info("Admin updating event: {}", id);
        EventDto updatedEvent = eventService.updateEvent(id, request);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        log.info("Admin deleting event: {}", id);
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreEvent(@PathVariable Long id) {
        log.info("Admin restoring event: {}", id);
        eventService.restoreEvent(id);
        return ResponseEntity.ok().build();
    }

    // ── Moderation endpoints ────────────────────────────────────────────────────

    @GetMapping("/pending")
    public ResponseEntity<Page<EventDto>> getPendingEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Admin listing pending events");
        return ResponseEntity.ok(eventService.getPendingEvents(page, size));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<EventDto> verifyEvent(@PathVariable Long id) {
        log.info("Admin verifying event id: {}", id);
        return ResponseEntity.ok(eventService.verifyEvent(id));
    }

    @DeleteMapping("/{id}/reject")
    public ResponseEntity<Void> rejectEvent(@PathVariable Long id) {
        log.info("Admin rejecting event id: {}", id);
        eventService.rejectEvent(id);
        return ResponseEntity.noContent().build();
    }
}
