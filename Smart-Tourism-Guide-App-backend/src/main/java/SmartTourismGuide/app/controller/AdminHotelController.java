//package SmartTourismGuide.app.controller;
//
//import SmartTourismGuide.app.dto.request.CreateHotelDto;
//import SmartTourismGuide.app.dto.request.CreateRoomDto;
//import SmartTourismGuide.app.dto.response.HotelResponseDto;
//import SmartTourismGuide.app.dto.response.RoomResponseDto;
//import SmartTourismGuide.app.dto.update.UpdateHotelDto;
//import SmartTourismGuide.app.service.BookingService;
//import SmartTourismGuide.app.service.HotelService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/admin/hotels")
//@RequiredArgsConstructor
//public class AdminHotelController {
//
//    private final HotelService hotelService;
//    private final BookingService bookingService;
//
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<HotelResponseDto> createHotel(@Valid @RequestBody CreateHotelDto createDto) {
//        HotelResponseDto createdHotel = hotelService.createHotel(createDto);
//        return ResponseEntity.status(HttpStatus.CREATED).body(createdHotel);
//    }
//
//    @PutMapping("/{hotelId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<HotelResponseDto> updateHotel(
//            @PathVariable Long hotelId,
//            @Valid @RequestBody UpdateHotelDto updateDto) {
//        HotelResponseDto updatedHotel = hotelService.updateHotel(hotelId, updateDto);
//        return ResponseEntity.ok(updatedHotel);
//    }
//
//    @DeleteMapping("/{hotelId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId) {
//        hotelService.deleteHotel(hotelId);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public Page<HotelResponseDto> getHotels(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//
//        return hotelService.getHotelsWithUser(page, size);
//    }
//
//    // Hotel Verification
//
//    @GetMapping("/unverified")
//    public ResponseEntity<List<HotelResponseDto>> getUnverifiedHotels() {
//        return ResponseEntity.ok(bookingService.getUnverifiedHotels());
//    }
//
//    @PatchMapping("/{id}/verify")
//    public ResponseEntity<HotelResponseDto> verifyHotel(@PathVariable Long id) {
//        return ResponseEntity.ok(bookingService.verifyHotel(id));
//    }
//
//    @DeleteMapping("/{id}/reject")
//    public ResponseEntity<Void> rejectHotel(@PathVariable Long id) {
//        bookingService.rejectHotel(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    // ── Room Management ─────────────────────────────────────────────────────
//
//    @PostMapping("/{hotelId}/rooms")
//    public ResponseEntity<RoomResponseDto> addRoom(
//            @PathVariable Long hotelId,
//            @Valid @RequestBody CreateRoomDto dto) {
//        dto.setHotelId(hotelId);
//        return ResponseEntity.ok(bookingService.addRoom(dto));
//    }
//}



package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.CreateHotelDto;
import SmartTourismGuide.app.dto.request.CreateRoomDto;
import SmartTourismGuide.app.dto.response.HotelResponseDto;
import SmartTourismGuide.app.dto.response.RoomResponseDto;
import SmartTourismGuide.app.dto.update.UpdateHotelDto;
import SmartTourismGuide.app.service.BookingService;
import SmartTourismGuide.app.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final HotelService hotelService;
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<HotelResponseDto> createHotel(@Valid @RequestBody CreateHotelDto createDto) {
        HotelResponseDto createdHotel = hotelService.createHotel(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHotel);
    }

    @PutMapping("/{hotelId}")
    public ResponseEntity<HotelResponseDto> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody UpdateHotelDto updateDto) {
        return ResponseEntity.ok(hotelService.updateHotel(hotelId, updateDto));
    }

    @DeleteMapping("/{hotelId}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId) {
        hotelService.deleteHotel(hotelId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public Page<HotelResponseDto> getHotels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return hotelService.getHotelsWithUser(page, size);
    }

    @GetMapping("/unverified")
    public ResponseEntity<List<HotelResponseDto>> getUnverifiedHotels() {
        return ResponseEntity.ok(bookingService.getUnverifiedHotels());
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<HotelResponseDto> verifyHotel(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.verifyHotel(id));
    }

    @DeleteMapping("/{id}/reject")
    public ResponseEntity<Void> rejectHotel(@PathVariable Long id) {
        bookingService.rejectHotel(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{hotelId}/rooms")
    public ResponseEntity<RoomResponseDto> addRoom(
            @PathVariable Long hotelId,
            @Valid @RequestBody CreateRoomDto dto) {
        dto.setHotelId(hotelId);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.addRoom(dto));
    }
}
