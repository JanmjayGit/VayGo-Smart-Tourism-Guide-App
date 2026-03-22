package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreateHotelDto;
import SmartTourismGuide.app.dto.request.HotelSearchRequestDto;
import SmartTourismGuide.app.dto.response.HotelResponseDto;
import SmartTourismGuide.app.service.HotelService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping("/search")
    public ResponseEntity<Page<HotelResponseDto>> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal maxPrice,
            @RequestParam(required = false) @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal minRating,
            @RequestParam(defaultValue = "true") Boolean availableOnly,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        HotelSearchRequestDto request = HotelSearchRequestDto.builder()
                .city(city)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .availableOnly(availableOnly)
                .page(page)
                .size(size)
                .build();

        Page<HotelResponseDto> hotels = hotelService.searchHotels(request);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<HotelResponseDto>> findNearbyHotels(
            @RequestParam @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double lat,
            @RequestParam @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double lon,
            @RequestParam(defaultValue = "10") @DecimalMin("0.1") @DecimalMax("100.0") Double radius,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin("0.0") BigDecimal maxPrice,
            @RequestParam(required = false) @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal minRating,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        Page<HotelResponseDto> hotels = hotelService.findNearbyHotels(
                lat, lon, radius, minPrice, maxPrice, minRating, page, size);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/{hotelId}")
    public ResponseEntity<HotelResponseDto> getHotelById(@PathVariable Long hotelId) {
        HotelResponseDto hotel = hotelService.getHotelById(hotelId);
        return ResponseEntity.ok(hotel);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<Page<HotelResponseDto>> findHotelsByCity(
            @PathVariable String city,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        Page<HotelResponseDto> hotels = hotelService.findHotelsByCity(city, page, size);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/price")
    public ResponseEntity<Page<HotelResponseDto>> filterByPriceRange(
            @RequestParam @NotNull @DecimalMin("0.0") BigDecimal minPrice,
            @RequestParam @NotNull @DecimalMin("0.0") BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer size) {

        if (minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("Minimum price cannot be greater than maximum price");
        }

        Page<HotelResponseDto> hotels = hotelService.filterByPriceRange(minPrice, maxPrice, page, size);
        return ResponseEntity.ok(hotels);
    }

    /**
     * POST /api/hotels/request
     * Authenticated users can submit a hotel for admin review (stored with
     * verified=false).
     */
    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HotelResponseDto> requestHotel(@RequestBody CreateHotelDto dto) {
        HotelResponseDto created = hotelService.requestHotel(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
