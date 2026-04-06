package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.update.UpdateRoomDto;
import SmartTourismGuide.app.dto.response.RoomResponseDto;
import SmartTourismGuide.app.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoomController {

    private final BookingService bookingService;

    @PutMapping("/{roomId}")
    public ResponseEntity<RoomResponseDto> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomDto dto) {
        return ResponseEntity.ok(bookingService.updateRoom(roomId, dto));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        bookingService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }
}

