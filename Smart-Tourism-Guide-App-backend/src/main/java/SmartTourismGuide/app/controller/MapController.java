package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.MapMarkerDto;
import SmartTourismGuide.app.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;


    @GetMapping("/markers/bbox")
    public ResponseEntity<List<MapMarkerDto>> getMarkersInBounds(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLon,
            @RequestParam Double maxLon,
            @RequestParam(required = false) List<String> categories) {

        List<MapMarkerDto> markers = mapService.getMarkersInBounds(
                minLat, maxLat, minLon, maxLon, categories);

        return ResponseEntity.ok(markers);
    }


    @GetMapping("/markers/nearby")
    public ResponseEntity<Page<MapMarkerDto>> getNearbyMarkers(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "10") Double radius,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Limit page size to 100
        size = Math.min(size, 100);

        Pageable pageable = PageRequest.of(page, size);
        Page<MapMarkerDto> markers = mapService.getNearbyMarkers(
                lat, lon, radius, categories, pageable);

        return ResponseEntity.ok(markers);
    }


    @GetMapping("/markers/category/{category}")
    public ResponseEntity<List<MapMarkerDto>> getMarkersByCategory(
            @PathVariable String category,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) Double minLon,
            @RequestParam(required = false) Double maxLon) {

        List<MapMarkerDto> markers = mapService.getMarkersByCategory(
                category, minLat, maxLat, minLon, maxLon);

        return ResponseEntity.ok(markers);
    }


    @GetMapping("/markers/{id}")
    public ResponseEntity<MapMarkerDto> getMarkerById(@PathVariable Long id) {
        MapMarkerDto marker = mapService.getMarkerById(id);
        return ResponseEntity.ok(marker);
    }
}
