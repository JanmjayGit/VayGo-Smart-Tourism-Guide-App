package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceStatus;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.PlaceMapper;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

        private final PlaceRepository placeRepository;

        @Override
        @Transactional(readOnly = true)
        public Page<PlaceDto> findNearbyPlaces(NearbyPlacesRequestDto request) {
                // Calculate bounding box for pre-filtering
                BoundingBox bbox = calculateBoundingBox(
                                request.getLatitude(),
                                request.getLongitude(),
                                request.getRadius());

                // Create pageable with sorting
                Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

                // Query database with bounding box and Haversine distance
                String categoryStr = request.getCategory() != null ? request.getCategory().name() : null;

                Page<Object[]> results = placeRepository.findNearbyPlaces(
                                request.getLatitude(),
                                request.getLongitude(),
                                bbox.minLat(),
                                bbox.maxLat(),
                                bbox.minLon(),
                                bbox.maxLon(),
                                request.getRadius(),
                                categoryStr,
                                request.getSort(),
                                pageable);

                // Map results to DTOs
                List<PlaceDto> placeDtos = results.getContent().stream()
                                .map(PlaceMapper::toPlaceDtoFromNativeQuery)
                                .collect(Collectors.toList());

                return new PageImpl<>(placeDtos, pageable, results.getTotalElements());
        }

        @Override
        @Transactional(readOnly = true)
        public NavigationResponseDto getNavigationData(Long placeId, Double userLat, Double userLon) {
                // Find the destination place (only active places)
                Place place = placeRepository.findByIdAndDeletedFalse(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

                // Calculate distance
                double distance = calculateDistance(
                                userLat,
                                userLon,
                                place.getLatitude().doubleValue(),
                                place.getLongitude().doubleValue());

                // Create source coordinate (user location)
                CoordinateDto source = CoordinateDto.builder()
                                .latitude(BigDecimal.valueOf(userLat))
                                .longitude(BigDecimal.valueOf(userLon))
                                .placeName("Your Location")
                                .build();

                // Create destination coordinate
                CoordinateDto destination = PlaceMapper.toCoordinateDto(place);

                // Estimate travel time (assuming average speed of 30 km/h in city)
                String estimatedTime = estimateTravelTime(distance);

                return NavigationResponseDto.builder()
                                .source(source)
                                .destination(destination)
                                .distance(distance)
                                .estimatedTravelTime(estimatedTime)
                                .build();
        }

        @Override
        public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
                // Haversine formula
                // R = Earth's radius in kilometers (6371 km)
                final double R = 6371.0;

                // Convert degrees to radians
                double lat1Rad = Math.toRadians(lat1);
                double lon1Rad = Math.toRadians(lon1);
                double lat2Rad = Math.toRadians(lat2);
                double lon2Rad = Math.toRadians(lon2);

                // Differences
                double dLat = lat2Rad - lat1Rad;
                double dLon = lon2Rad - lon1Rad;

                // Haversine formula
                double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                                                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                // Distance in kilometers
                return R * c;
        }

        private BoundingBox calculateBoundingBox(double lat, double lon, double radiusKm) {
                // 1 degree of latitude ≈ 111.32 km
                final double KM_PER_DEGREE_LAT = 111.32;

                // 1 degree of longitude varies by latitude
                // At equator: 111.32 km, at poles: 0 km
                double kmPerDegreeLon = KM_PER_DEGREE_LAT * Math.cos(Math.toRadians(lat));

                // Calculate deltas
                double deltaLat = radiusKm / KM_PER_DEGREE_LAT;
                double deltaLon = radiusKm / kmPerDegreeLon;

                // Calculate bounding box
                BigDecimal minLat = BigDecimal.valueOf(lat - deltaLat);
                BigDecimal maxLat = BigDecimal.valueOf(lat + deltaLat);
                BigDecimal minLon = BigDecimal.valueOf(lon - deltaLon);
                BigDecimal maxLon = BigDecimal.valueOf(lon + deltaLon);

                return new BoundingBox(minLat, maxLat, minLon, maxLon);
        }

        private String estimateTravelTime(double distanceKm) {
                final double AVERAGE_SPEED_KMH = 30.0; // City average speed
                double hours = distanceKm / AVERAGE_SPEED_KMH;
                int minutes = (int) Math.ceil(hours * 60);

                if (minutes < 60) {
                        return minutes + " minutes";
                } else {
                        int hrs = minutes / 60;
                        int mins = minutes % 60;
                        return hrs + " hour" + (hrs > 1 ? "s" : "") +
                                        (mins > 0 ? " " + mins + " minutes" : "");
                }
        }

        private record BoundingBox(
                        BigDecimal minLat,
                        BigDecimal maxLat,
                        BigDecimal minLon,
                        BigDecimal maxLon) {
        }

        // Admin methods implementation

        @Override
        @Transactional
        public PlaceDetailsDto createPlace(CreatePlaceDto createDto) {
                Place place = new Place();
                place.setName(createDto.getName());
                place.setDescription(createDto.getDescription());
                place.setCategory(createDto.getCategory());
                place.setLatitude(createDto.getLatitude());
                place.setLongitude(createDto.getLongitude());
                place.setAddress(createDto.getAddress());
                place.setRating(createDto.getRating());
                place.setPopularity(0L);
                place.setImageUrl(createDto.getImageUrl());
                if (createDto.getImageUrls() != null && !createDto.getImageUrls().isEmpty()) {
                        place.setImageUrls(createDto.getImageUrls());
                }
                place.setCity(createDto.getCity());
                place.setContactInfo(createDto.getContactInfo());
                place.setOpeningHours(createDto.getOpeningHours());
                place.setPriceRange(createDto.getPriceRange());

                Place savedPlace = placeRepository.save(place);
                return PlaceMapper.toPlaceDetailsDto(savedPlace);
        }

        @Override
        @Transactional
        public PlaceDetailsDto updatePlace(Long placeId, UpdatePlaceDto updateDto) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

                // Update only non-null fields
                if (updateDto.getName() != null) {
                        place.setName(updateDto.getName());
                }
                if (updateDto.getDescription() != null) {
                        place.setDescription(updateDto.getDescription());
                }
                if (updateDto.getCategory() != null) {
                        place.setCategory(updateDto.getCategory());
                }
                if (updateDto.getLatitude() != null) {
                        place.setLatitude(updateDto.getLatitude());
                }
                if (updateDto.getLongitude() != null) {
                        place.setLongitude(updateDto.getLongitude());
                }
                if (updateDto.getAddress() != null) {
                        place.setAddress(updateDto.getAddress());
                }
                if (updateDto.getRating() != null) {
                        place.setRating(updateDto.getRating());
                }
                if (updateDto.getImageUrl() != null) {
                        place.setImageUrl(updateDto.getImageUrl());
                }
                if (updateDto.getImageUrls() != null) {
                        place.setImageUrls(updateDto.getImageUrls());
                }
                if (updateDto.getCity() != null) {
                        place.setCity(updateDto.getCity());
                }
                if (updateDto.getContactInfo() != null) {
                        place.setContactInfo(updateDto.getContactInfo());
                }
                if (updateDto.getOpeningHours() != null) {
                        place.setOpeningHours(updateDto.getOpeningHours());
                }
                if (updateDto.getPriceRange() != null) {
                        place.setPriceRange(updateDto.getPriceRange());
                }

                Place updatedPlace = placeRepository.save(place);
                return PlaceMapper.toPlaceDetailsDto(updatedPlace);
        }

        @Override
        @Transactional
        public void deletePlace(Long placeId) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

                // Soft delete: mark as deleted instead of removing from database
                place.setDeleted(true);
                place.setDeletedAt(java.time.LocalDateTime.now());
                placeRepository.save(place);
        }

        @Override
        @Transactional(readOnly = true)
        public PlaceDetailsDto getPlaceById(Long placeId) {
                // For public access, only return active (non-deleted) places
                Place place = placeRepository.findByIdAndDeletedFalse(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));
                return PlaceMapper.toPlaceDetailsDto(place);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<PlaceDetailsDto> getAllPlaces(int page, int size, boolean includeDeleted) {
                Pageable pageable = PageRequest.of(page, size);
                Page<Place> places = placeRepository.findAllWithDeletedFilter(includeDeleted, pageable);
                return places.map(PlaceMapper::toPlaceDetailsDto);
        }

        @Override
        @Transactional
        public PlaceDetailsDto restorePlace(Long placeId) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

                if (!place.getDeleted()) {
                        throw new IllegalStateException("Place is not deleted and cannot be restored");
                }

                // Restore: unmark as deleted
                place.setDeleted(false);
                place.setDeletedAt(null);
                Place restoredPlace = placeRepository.save(place);
                return PlaceMapper.toPlaceDetailsDto(restoredPlace);
        }

        // User sbmit places
        @Override
        @Transactional
        public PlaceDetailsDto submitPlace(Long userId, CreatePlaceDto dto) {
                Place place = new Place();
                place.setName(dto.getName());
                place.setDescription(dto.getDescription());
                place.setCategory(dto.getCategory());
                place.setLatitude(dto.getLatitude());
                place.setLongitude(dto.getLongitude());
                place.setAddress(dto.getAddress());
                place.setRating(dto.getRating() != null ? dto.getRating() : BigDecimal.ZERO);
                place.setPopularity(0L);
                place.setImageUrl(dto.getImageUrl());
                if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                        place.setImageUrls(dto.getImageUrls());
                }
                place.setCity(dto.getCity());
                place.setContactInfo(dto.getContactInfo());
                place.setOpeningHours(dto.getOpeningHours());
                place.setPriceRange(dto.getPriceRange());
                // Mark as PENDING — awaiting admin review
                place.setVerified(false);
                place.setStatus(PlaceStatus.PENDING);
                place.setSubmittedByUserId(userId);
                return PlaceMapper.toPlaceDetailsDto(placeRepository.save(place));
        }

        // User: fetch own submitted places
        @Override
        @Transactional(readOnly = true)
        public java.util.List<PlaceDetailsDto> getUserPlaces(Long userId) {
                return placeRepository.findBySubmittedByUserIdAndDeletedFalse(userId)
                        .stream()
                        .map(PlaceMapper::toPlaceDetailsDto)
                        .collect(Collectors.toList());
        }

        // User: edit own PENDING place
        @Override
        @Transactional
        public PlaceDetailsDto userEditPlace(Long placeId, Long userId, CreatePlaceDto dto) {
                Place place = placeRepository.findByIdAndDeletedFalse(placeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

                if (!userId.equals(place.getSubmittedByUserId())) {
                        throw new AccessDeniedException(
                                "You can only edit your own submissions");
                }
                if (place.getVerified()) {
                        throw new IllegalStateException("Cannot edit an already-approved place");
                }

                if (dto.getName() != null)        place.setName(dto.getName());
                if (dto.getDescription() != null) place.setDescription(dto.getDescription());
                if (dto.getCity() != null)        place.setCity(dto.getCity());
                if (dto.getImageUrl() != null)    place.setImageUrl(dto.getImageUrl());
                if (dto.getAddress() != null)     place.setAddress(dto.getAddress());

                return PlaceMapper.toPlaceDetailsDto(placeRepository.save(place));
        }


        @Override
        @Transactional(readOnly = true)
        public Page<PlaceDetailsDto> getPendingPlaces(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                // Only return places awaiting verification (verified=false, not deleted)
                return placeRepository.findByVerifiedFalseAndDeletedFalse(pageable)
                                .map(PlaceMapper::toPlaceDetailsDto);
        }


        @Override
        @Transactional
        public PlaceDetailsDto verifyPlace(Long placeId) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));
                if (place.getDeleted()) {
                        throw new IllegalStateException("Cannot verify a deleted place");
                }
                place.setVerified(true);
                place.setStatus(PlaceStatus.APPROVED);
                return PlaceMapper.toPlaceDetailsDto(placeRepository.save(place));
        }

        @Override
        public void rejectPlace(Long placeId) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

                place.setStatus(PlaceStatus.REJECTED);
                place.setDeleted(true);
                place.setDeletedAt(java.time.LocalDateTime.now());
                placeRepository.save(place);
        }
}
