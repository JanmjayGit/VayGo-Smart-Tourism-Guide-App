package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.NavigationResponseDto;
import SmartTourismGuide.app.dto.request.NearbyPlacesRequestDto;
import SmartTourismGuide.app.dto.response.PlaceDto;
import SmartTourismGuide.app.enums.PlaceCategory;
import SmartTourismGuide.app.service.PlaceService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
@Validated
public class PlaceController {

        private final PlaceService placeService;

        @GetMapping
        public ResponseEntity<Page<PlaceDto>> getAllPlaces(
                        @RequestParam(defaultValue = "0") Integer page,
                        @RequestParam(defaultValue = "20") Integer size) {

                // Use the existing getAllPlaces method (returns PlaceDetailsDto)
                // Note: This returns all places without search/filter for now
                // Frontend will need to handle filtering client-side or we can enhance this
                // later
                Page<SmartTourismGuide.app.dto.response.PlaceDetailsDto> detailsPage = placeService.getAllPlaces(page,
                                size,
                                false);

                // Convert PlaceDetailsDto to PlaceDto
                Page<PlaceDto> placesPage = detailsPage.map(details -> PlaceDto.builder()
                                .id(details.getId())
                                .name(details.getName())
                                .description(details.getDescription())
                                .category(details.getCategory())
                                .latitude(details.getLatitude())
                                .longitude(details.getLongitude())
                                .address(details.getAddress())
                                .city(details.getCity())
                                .rating(details.getRating())
                                .reviewCount(details.getPopularity()) // popularity == review count
                                .imageUrl(details.getImageUrl())
                                .priceRange(details.getPriceRange())
                                .build());

                return ResponseEntity.ok(placesPage);
        }

        @GetMapping("/nearby")
        public ResponseEntity<Page<PlaceDto>> getNearbyPlaces(
                        @RequestParam @NotNull(message = "Latitude is required") @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90") @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90") Double lat,

                        @RequestParam @NotNull(message = "Longitude is required") @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180") @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180") Double lon,

                        @RequestParam @NotNull(message = "Radius is required") @DecimalMin(value = "0.1", message = "Radius must be at least 0.1 km") @DecimalMax(value = "100.0", message = "Radius cannot exceed 100 km") Double radius,

                        @RequestParam(required = false) String category,

                        @RequestParam(defaultValue = "0") Integer page,

                        @RequestParam(defaultValue = "20") Integer size,

                        @RequestParam(defaultValue = "distance") String sort) {
                // Build request DTO
                NearbyPlacesRequestDto request = NearbyPlacesRequestDto.builder()
                                .latitude(lat)
                                .longitude(lon)
                                .radius(radius)
                                .category(category != null ? PlaceCategory.valueOf(category.toUpperCase())
                                                : null)
                                .page(page)
                                .size(size)
                                .sort(sort)
                                .build();

                Page<PlaceDto> nearbyPlaces = placeService.findNearbyPlaces(request);
                return ResponseEntity.ok(nearbyPlaces);
        }

        @GetMapping("/{placeId}/navigation")
        public ResponseEntity<NavigationResponseDto> getNavigationData(
                        @PathVariable Long placeId,

                        @RequestParam @NotNull(message = "User latitude is required") @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90") @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90") Double userLat,

                        @RequestParam @NotNull(message = "User longitude is required") @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180") @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180") Double userLon) {
                NavigationResponseDto navigationData = placeService.getNavigationData(placeId, userLat, userLon);
                return ResponseEntity.ok(navigationData);
        }

        @GetMapping("/{placeId}")
        public ResponseEntity<SmartTourismGuide.app.dto.response.PlaceDetailsDto> getPlaceDetails(
                        @PathVariable Long placeId) {
                return ResponseEntity.ok(placeService.getPlaceById(placeId));
        }

        // ── User Submission ─────────────────────────────────────────────────────

        @PostMapping("/submit")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public ResponseEntity<SmartTourismGuide.app.dto.response.PlaceDetailsDto> submitPlace(
                        @jakarta.validation.Valid @RequestBody SmartTourismGuide.app.dto.request.CreatePlaceDto dto,
                        @org.springframework.security.core.annotation.AuthenticationPrincipal SmartTourismGuide.app.security.services.UserDetailsImpl userDetails) {
                return ResponseEntity
                                .status(org.springframework.http.HttpStatus.CREATED)
                                .body(placeService.submitPlace(userDetails.getId(), dto));
        }
}
