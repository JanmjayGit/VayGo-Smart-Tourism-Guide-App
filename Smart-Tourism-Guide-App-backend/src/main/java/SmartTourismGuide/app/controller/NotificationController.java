package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.NotificationRequest;
import SmartTourismGuide.app.dto.response.NotificationDto;
import SmartTourismGuide.app.dto.response.NotificationPreferenceDto;
import SmartTourismGuide.app.security.services.UserDetailsImpl;
import SmartTourismGuide.app.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getUserNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDto> notifications = notificationService.getUserNotifications(
                userDetails.getId(),
                pageable);

        return ResponseEntity.ok(notifications);
    }

    //Get unread notifications
    @GetMapping("/unread")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDto> notifications = notificationService.getUnreadNotifications(
                userDetails.getId(),
                pageable);

        return ResponseEntity.ok(notifications);
    }

     // Get unread notification count
    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        long count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    // Mark all notifications as read
    @PutMapping("/read-all")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        notificationService.deleteNotification(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    // Get user notification preferences
    @GetMapping("/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<NotificationPreferenceDto> getPreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        NotificationPreferenceDto preferences = notificationService.getUserPreferences(userDetails.getId());
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<NotificationPreferenceDto> updatePreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody NotificationPreferenceDto preferences) {

        NotificationPreferenceDto updated = notificationService.updateUserPreferences(
                userDetails.getId(),
                preferences);

        return ResponseEntity.ok(updated);
    }

    // Send broadcast notification (Admin only)
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendBroadcast(@Valid @RequestBody NotificationRequest request) {

        notificationService.sendBroadcast(
                request.getType(),
                request.getTitle(),
                request.getMessage(),
                request.getPriority());

        return ResponseEntity.ok().build();
    }
}
