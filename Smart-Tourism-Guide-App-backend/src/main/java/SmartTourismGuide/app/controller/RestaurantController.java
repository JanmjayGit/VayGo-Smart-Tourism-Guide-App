package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.RestaurantResponseDto;
import SmartTourismGuide.app.dto.request.RestaurantSearchRequestDto;
import SmartTourismGuide.app.service.RestaurantService;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping("/search")
    public ResponseEntity<Page<RestaurantResponseDto>> searchRestaurants(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String foodCategory,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal maxPrice,
            @RequestParam(required = false) @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal minRating,
            @RequestParam(defaultValue = "true") Boolean activeOnly,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        RestaurantSearchRequestDto request = RestaurantSearchRequestDto.builder()
                .city(city)
                .cuisineType(cuisineType)
                .foodCategory(foodCategory)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .activeOnly(activeOnly)
                .page(page)
                .size(size)
                .build();

        Page<RestaurantResponseDto> restaurants = restaurantService.searchRestaurants(request);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<RestaurantResponseDto>> findNearbyRestaurants(
            @RequestParam @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double lat,
            @RequestParam @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double lon,
            @RequestParam(defaultValue = "10") @DecimalMin("0.1") @DecimalMax("100.0") Double radius,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String foodCategory,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal maxPrice,
            @RequestParam(required = false) @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal minRating,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        Page<RestaurantResponseDto> restaurants = restaurantService.findNearbyRestaurants(
                lat, lon, radius, cuisineType, foodCategory, minPrice, maxPrice, minRating, page, size);
        return ResponseEntity.ok(restaurants);
    }


    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantResponseDto> getRestaurantById(@PathVariable Long restaurantId) {
        RestaurantResponseDto restaurant = restaurantService.getRestaurantById(restaurantId);
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/cuisine/{cuisineType}")
    public ResponseEntity<Page<RestaurantResponseDto>> findByCuisine(
            @PathVariable String cuisineType,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        Page<RestaurantResponseDto> restaurants = restaurantService.findByCuisine(cuisineType, page, size);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/category/{foodCategory}")
    public ResponseEntity<Page<RestaurantResponseDto>> findByFoodCategory(
            @PathVariable String foodCategory,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        Page<RestaurantResponseDto> restaurants = restaurantService.findByFoodCategory(foodCategory, page, size);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<Page<RestaurantResponseDto>> findByCity(
            @PathVariable String city,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        Page<RestaurantResponseDto> restaurants = restaurantService.findByCity(city, page, size);
        return ResponseEntity.ok(restaurants);
    }
}
