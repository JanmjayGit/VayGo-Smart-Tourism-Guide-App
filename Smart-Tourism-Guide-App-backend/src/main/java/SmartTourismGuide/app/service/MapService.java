package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.MapMarkerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface MapService {

    List<MapMarkerDto> getMarkersInBounds(
            Double minLat,
            Double maxLat,
            Double minLon,
            Double maxLon,
            List<String> categories);


    Page<MapMarkerDto> getNearbyMarkers(
            Double lat,
            Double lon,
            Double radius,
            List<String> categories,
            Pageable pageable);


    List<MapMarkerDto> getMarkersByCategory(
            String category,
            Double minLat,
            Double maxLat,
            Double minLon,
            Double maxLon);

    MapMarkerDto getMarkerById(Long placeId);
}
