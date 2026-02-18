package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreatePlaceDto;
import SmartTourismGuide.app.dto.response.PlaceDetailsDto;
import SmartTourismGuide.app.dto.update.UpdatePlaceDto;
import SmartTourismGuide.app.service.PlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
public class AdminPlaceController {

    private final PlaceService placeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> createPlace(@Valid @RequestBody CreatePlaceDto createDto) {
        PlaceDetailsDto createdPlace = placeService.createPlace(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlace);
    }

    @PutMapping("/{placeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> updatePlace(
            @PathVariable Long placeId,
            @Valid @RequestBody UpdatePlaceDto updateDto) {
        PlaceDetailsDto updatedPlace = placeService.updatePlace(placeId, updateDto);
        return ResponseEntity.ok(updatedPlace);
    }


    @DeleteMapping("/{placeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlace(@PathVariable Long placeId) {
        placeService.deletePlace(placeId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{placeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> getPlaceById(@PathVariable Long placeId) {
        PlaceDetailsDto place = placeService.getPlaceById(placeId);
        return ResponseEntity.ok(place);
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PlaceDetailsDto>> getAllPlaces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        Page<PlaceDetailsDto> places = placeService.getAllPlaces(page, size, includeDeleted);
        return ResponseEntity.ok(places);
    }


    @PutMapping("/{placeId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> restorePlace(@PathVariable Long placeId) {
        PlaceDetailsDto restoredPlace = placeService.restorePlace(placeId);
        return ResponseEntity.ok(restoredPlace);
    }
}
