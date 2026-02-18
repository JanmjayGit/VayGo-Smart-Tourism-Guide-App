package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreateHotelDto;
import SmartTourismGuide.app.dto.response.PlaceDetailsDto;
import SmartTourismGuide.app.dto.update.UpdateHotelDto;
import SmartTourismGuide.app.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
public class AdminHotelController {

    private final HotelService hotelService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> createHotel(@Valid @RequestBody CreateHotelDto createDto) {
        PlaceDetailsDto createdHotel = hotelService.createHotel(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHotel);
    }

    @PutMapping("/{hotelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaceDetailsDto> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody UpdateHotelDto updateDto) {
        PlaceDetailsDto updatedHotel = hotelService.updateHotel(hotelId, updateDto);
        return ResponseEntity.ok(updatedHotel);
    }


    @DeleteMapping("/{hotelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId) {
        hotelService.deleteHotel(hotelId);
        return ResponseEntity.noContent().build();
    }
}
