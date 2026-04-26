package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.enums.PlaceCategory;
import org.springframework.data.domain.Page;

public interface PlaceService {

    Page<PlaceDto> findNearbyPlaces(NearbyPlacesRequestDto request);

    NavigationResponseDto getNavigationData(Long placeId, Double userLat, Double userLon);

    double calculateDistance(double lat1, double lon1, double lat2, double lon2);

    // Admin methods
    PlaceDetailsDto createPlace(CreatePlaceDto createDto);

    PlaceDetailsDto updatePlace(Long placeId, UpdatePlaceDto updateDto);

    void deletePlace(Long placeId);

    PlaceDetailsDto getPlaceById(Long placeId);

    Page<PlaceDetailsDto> getAllPlaces(int page, int size, boolean includeDeleted);

    PlaceDetailsDto restorePlace(Long placeId);

    // User submission and admin moderation
    PlaceDetailsDto submitPlace(Long userId, CreatePlaceDto dto);

    java.util.List<PlaceDetailsDto> getUserPlaces(Long userId);

    PlaceDetailsDto userEditPlace(Long placeId, Long userId, CreatePlaceDto dto);

    org.springframework.data.domain.Page<PlaceDetailsDto> getPendingPlaces(int page, int size);

    PlaceDetailsDto verifyPlace(Long placeId);

    void rejectPlace(Long placeId);
}
