package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.EmergencyServiceRequest;
import SmartTourismGuide.app.dto.response.EmergencyServiceDto;
import SmartTourismGuide.app.enums.EmergencyServiceCategory;
import SmartTourismGuide.app.enums.NotificationPriority;
import SmartTourismGuide.app.service.EmergencyNotificationService;
import SmartTourismGuide.app.service.EmergencyService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
@Slf4j
@Validated
public class EmergencyController {

    private final EmergencyService emergencyService;
    private final EmergencyNotificationService emergencyNotificationService;

    // find near by places
    @GetMapping("/nearby")
    public ResponseEntity<List<EmergencyServiceDto>> findNearby(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") Double lat,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") Double lon,
            @RequestParam(defaultValue = "5.0") @DecimalMin("0.1") @DecimalMax("50.0") Double radius,
            @RequestParam(required = false) EmergencyServiceCategory category,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer limit) {

        log.info("GET /api/emergency/nearby - lat={}, lon={}, radius={}, category={}, limit={}",
                lat, lon, radius, category, limit);

        List<EmergencyServiceDto> services = emergencyService.findNearby(
                lat, lon, radius, category, limit);

        return ResponseEntity.ok(services);
    }


    // Find emergency services by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<EmergencyServiceDto>> findByCategory(
            @PathVariable EmergencyServiceCategory category,
            @RequestParam(required = false) String city) {

        log.info("GET /api/emergency/category/{} - city={}", category, city);

        List<EmergencyServiceDto> services;
        if (city != null && !city.trim().isEmpty()) {
            services = emergencyService.findByCity(city).stream()
                    .filter(s -> s.getCategory() == category)
                    .toList();
        } else {
            services = emergencyService.findByCategory(category);
        }

        return ResponseEntity.ok(services);
    }

    // Find emergency services by city
    @GetMapping("/city/{city}")
    public ResponseEntity<List<EmergencyServiceDto>> findByCity(@PathVariable String city) {
        log.info("GET /api/emergency/city/{}", city);

        List<EmergencyServiceDto> services = emergencyService.findByCity(city);
        return ResponseEntity.ok(services);
    }

    // Find 24x7 emergency services
    @GetMapping("/24x7")
    public ResponseEntity<List<EmergencyServiceDto>> find24x7Services() {
        log.info("GET /api/emergency/24x7");

        List<EmergencyServiceDto> services = emergencyService.find24x7Services();
        return ResponseEntity.ok(services);
    }


     // Get emergency service by ID
    @GetMapping("/{id}")
    public ResponseEntity<EmergencyServiceDto> getById(@PathVariable Long id) {
        log.info("GET /api/emergency/{}", id);

        EmergencyServiceDto service = emergencyService.getById(id);
        return ResponseEntity.ok(service);
    }


    // Create new emergency service (admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmergencyServiceDto> create(
            @Valid @RequestBody EmergencyServiceRequest request) {

        log.info("POST /api/emergency - name={}", request.getName());

        EmergencyServiceDto created = emergencyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    // Update emergency service (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmergencyServiceDto> update(
            @PathVariable Long id,
            @Valid @RequestBody EmergencyServiceRequest request) {

        log.info("PUT /api/emergency/{}", id);

        EmergencyServiceDto updated = emergencyService.update(id, request);
        return ResponseEntity.ok(updated);
    }

     // Delete emergency service (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/emergency/{}", id);

        emergencyService.delete(id);
        return ResponseEntity.noContent().build();
    }

     // Broadcast emergency alert (admin only)
    @PostMapping("/alert")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> broadcastAlert(@Valid @RequestBody EmergencyAlertRequest request) {
        log.info("POST /api/emergency/alert - city={}", request.getCity());

        String title = request.getTitle() != null ? request.getTitle() : "Emergency Alert";
        NotificationPriority priority = request.getPriority() != null
                ? request.getPriority()
                : NotificationPriority.CRITICAL;

        emergencyNotificationService.sendEmergencyAlert(
                request.getCity(), title, request.getMessage(), priority);

        return ResponseEntity.ok("Emergency alert sent successfully");
    }

    @GetMapping("/stats")
    public ResponseEntity<EmergencyStats> getStats() {
        log.info("GET /api/emergency/stats");

        EmergencyStats stats = new EmergencyStats();
        stats.setTotalHospitals(emergencyService.countByCategory(EmergencyServiceCategory.HOSPITAL));
        stats.setTotalPoliceStations(emergencyService.countByCategory(EmergencyServiceCategory.POLICE_STATION));
        stats.setTotalFireStations(emergencyService.countByCategory(EmergencyServiceCategory.FIRE_STATION));
        stats.setTotalPharmacies(emergencyService.countByCategory(EmergencyServiceCategory.PHARMACY));

        return ResponseEntity.ok(stats);
    }

     // Emergency alert request DTO
    @Data
    public static class EmergencyAlertRequest {
        private String city; // null for broadcast
        private String title;
        private String message;
        private NotificationPriority priority;
    }

    @Data
    public static class EmergencyStats {
        private Long totalHospitals;
        private Long totalPoliceStations;
        private Long totalFireStations;
        private Long totalPharmacies;
    }
}
