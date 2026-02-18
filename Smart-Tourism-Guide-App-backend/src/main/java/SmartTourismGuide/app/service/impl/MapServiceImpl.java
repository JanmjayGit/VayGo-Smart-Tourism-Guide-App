package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.response.MapMarkerDto;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceCategory;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class MapServiceImpl implements MapService {

    private final PlaceRepository placeRepository;

    private static final int MAX_MARKERS = 500; // Limit for map rendering performance

    @Override
    @Transactional(readOnly = true)
    public List<MapMarkerDto> getMarkersInBounds(
            Double minLat,
            Double maxLat,
            Double minLon,
            Double maxLon,
            List<String> categories) {

        // Validate coordinates
        validateCoordinates(minLat, maxLat, minLon, maxLon);

        // Query places in bounding box
        List<Place> places = placeRepository.findInBoundingBox(
                minLat, maxLat, minLon, maxLon, categories);

        // Limit results for performance
        if (places.size() > MAX_MARKERS) {
            places = places.subList(0, MAX_MARKERS);
        }

        // Convert to DTOs
        return places.stream()
                .map(this::convertToMarkerDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MapMarkerDto> getNearbyMarkers(
            Double lat,
            Double lon,
            Double radius,
            List<String> categories,
            Pageable pageable) {

        // Validate coordinates and radius
        validateLatitude(lat);
        validateLongitude(lon);
        validateRadius(radius);

        // Calculate bounding box for pre-filtering
        double latDelta = radius / 111.0; // ~111km per degree latitude
        double lonDelta = radius / (111.0 * Math.cos(Math.toRadians(lat)));

        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLon = lon - lonDelta;
        double maxLon = lon + lonDelta;

        // Get places in bounding box
        List<Place> places = placeRepository.findInBoundingBox(
                minLat, maxLat, minLon, maxLon, categories);

        // Calculate distances and filter by radius
        List<MapMarkerDto> markers = new ArrayList<>();
        for (Place place : places) {
            double placeLat = place.getLatitude() != null ? place.getLatitude().doubleValue() : 0.0;
            double placeLon = place.getLongitude() != null ? place.getLongitude().doubleValue() : 0.0;
            double distance = calculateDistance(lat, lon, placeLat, placeLon);
            if (distance <= radius) {
                MapMarkerDto marker = convertToMarkerDto(place);
                marker.setDistance(distance);
                markers.add(marker);
            }
        }

        // Sort by distance
        markers.sort(Comparator.comparing(MapMarkerDto::getDistance));

        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), markers.size());

        List<MapMarkerDto> pageContent = markers.subList(start, end);

        return new PageImpl<>(pageContent, pageable, markers.size());
    }


    @Override
    @Transactional(readOnly = true)
    public List<MapMarkerDto> getMarkersByCategory(
            String category,
            Double minLat,
            Double maxLat,
            Double minLon,
            Double maxLon) {

        // Validate coordinates if provided
        if (minLat != null && maxLat != null && minLon != null && maxLon != null) {
            validateCoordinates(minLat, maxLat, minLon, maxLon);
        }

        // Convert string to PlaceCategory enum
        PlaceCategory placeCategory;
        try {
            placeCategory = PlaceCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid category: " + category +
                    ". Valid categories are: HOTEL, RESTAURANT, ATTRACTION, EVENT");
        }

        // Query places by category
        List<Place> places = placeRepository.findByCategoryInBounds(
                placeCategory, minLat, maxLat, minLon, maxLon);

        // Limit results
        if (places.size() > MAX_MARKERS) {
            places = places.subList(0, MAX_MARKERS);
        }

        // Convert to DTOs
        return places.stream()
                .map(this::convertToMarkerDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MapMarkerDto getMarkerById(Long placeId) {
        Place place = placeRepository.findByIdAndDeletedFalse(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        return convertToMarkerDto(place);
    }


    private MapMarkerDto convertToMarkerDto(Place place) {
        return new MapMarkerDto(
                place.getId(),
                place.getName(),
                place.getCategory() != null ? place.getCategory().toString() : null,
                place.getLatitude() != null ? place.getLatitude().doubleValue() : null,
                place.getLongitude() != null ? place.getLongitude().doubleValue() : null,
                place.getRating(),
                calculatePopularity(place),
                place.getImageUrl(),
                null // Distance will be set separately for nearby queries
        );
    }

    private Integer calculatePopularity(Place place) {
        // Simple popularity calculation based on rating
        // Returns rating * 100 for marker sizing (0-500 range)
        if (place.getRating() != null) {
            return (int) (place.getRating().doubleValue() * 100);
        }
        return 0;
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    private void validateCoordinates(Double minLat, Double maxLat, Double minLon, Double maxLon) {
        validateLatitude(minLat);
        validateLatitude(maxLat);
        validateLongitude(minLon);
        validateLongitude(maxLon);

        if (minLat >= maxLat) {
            throw new IllegalArgumentException("minLat must be less than maxLat");
        }
        if (minLon >= maxLon) {
            throw new IllegalArgumentException("minLon must be less than maxLon");
        }
    }

    private void validateLatitude(Double lat) {
        if (lat == null || lat < -90.0 || lat > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
    }

    private void validateLongitude(Double lon) {
        if (lon == null || lon < -180.0 || lon > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
    }

    private void validateRadius(Double radius) {
        if (radius == null || radius < 0.1 || radius > 100.0) {
            throw new IllegalArgumentException("Radius must be between 0.1 and 100 km");
        }
    }
}
