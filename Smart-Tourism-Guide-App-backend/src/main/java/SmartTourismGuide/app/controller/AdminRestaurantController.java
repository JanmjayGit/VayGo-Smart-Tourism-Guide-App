package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreateRestaurantDto;
import SmartTourismGuide.app.dto.response.PlaceDetailsDto;
import SmartTourismGuide.app.dto.update.UpdateRestaurantDto;
import SmartTourismGuide.app.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/restaurants")
@RequiredArgsConstructor
public class AdminRestaurantController {

    private final RestaurantService restaurantService;


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> createRestaurant(@Valid @RequestBody CreateRestaurantDto createDto) {
        PlaceDetailsDto createdRestaurant = restaurantService.createRestaurant(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRestaurant);
    }


    @PutMapping("/{restaurantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> updateRestaurant(
            @PathVariable Long restaurantId,
            @Valid @RequestBody UpdateRestaurantDto updateDto) {
        PlaceDetailsDto updatedRestaurant = restaurantService.updateRestaurant(restaurantId, updateDto);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @DeleteMapping("/{restaurantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long restaurantId) {
        restaurantService.deleteRestaurant(restaurantId);
        return ResponseEntity.noContent().build();
    }
}
