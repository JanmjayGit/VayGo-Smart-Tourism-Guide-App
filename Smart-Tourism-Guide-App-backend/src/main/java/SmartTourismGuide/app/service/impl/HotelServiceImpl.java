package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceCategory;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.HotelMapper;
import SmartTourismGuide.app.mapper.PlaceMapper;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final PlaceRepository placeRepository;

    @Override
    @Transactional
    public PlaceDetailsDto createHotel(CreateHotelDto createDto) {
        Place hotel = new Place();
        hotel.setName(createDto.getName());
        hotel.setDescription(createDto.getDescription());
        hotel.setCategory(PlaceCategory.HOTEL); // Always set to HOTEL
        hotel.setLatitude(createDto.getLatitude());
        hotel.setLongitude(createDto.getLongitude());
        hotel.setCity(createDto.getCity());
        hotel.setAddress(createDto.getAddress());
        hotel.setPricePerNight(createDto.getPricePerNight());
        hotel.setRating(createDto.getRating());
        hotel.setImageUrl(createDto.getImageUrl());
        hotel.setContactInfo(createDto.getContactInfo());
        hotel.setOpeningHours(createDto.getOpeningHours());
        hotel.setPriceRange(createDto.getPriceRange());
        hotel.setAmenities(createDto.getAmenities());
        hotel.setAvailabilityStatus(createDto.getAvailabilityStatus());
        hotel.setPopularity(0L);
        hotel.setDeleted(false);

        Place savedHotel = placeRepository.save(hotel);
        return PlaceMapper.toPlaceDetailsDto(savedHotel);
    }

    @Override
    @Transactional
    public PlaceDetailsDto updateHotel(Long hotelId, UpdateHotelDto updateDto) {
        Place hotel = placeRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        // Verify it's actually a hotel
        if (hotel.getCategory() != PlaceCategory.HOTEL) {
            throw new IllegalStateException("Place with id " + hotelId + " is not a hotel");
        }

        // Update only non-null fields
        if (updateDto.getName() != null) {
            hotel.setName(updateDto.getName());
        }
        if (updateDto.getDescription() != null) {
            hotel.setDescription(updateDto.getDescription());
        }
        if (updateDto.getLatitude() != null) {
            hotel.setLatitude(updateDto.getLatitude());
        }
        if (updateDto.getLongitude() != null) {
            hotel.setLongitude(updateDto.getLongitude());
        }
        if (updateDto.getCity() != null) {
            hotel.setCity(updateDto.getCity());
        }
        if (updateDto.getAddress() != null) {
            hotel.setAddress(updateDto.getAddress());
        }
        if (updateDto.getPricePerNight() != null) {
            hotel.setPricePerNight(updateDto.getPricePerNight());
        }
        if (updateDto.getRating() != null) {
            hotel.setRating(updateDto.getRating());
        }
        if (updateDto.getImageUrl() != null) {
            hotel.setImageUrl(updateDto.getImageUrl());
        }
        if (updateDto.getContactInfo() != null) {
            hotel.setContactInfo(updateDto.getContactInfo());
        }
        if (updateDto.getOpeningHours() != null) {
            hotel.setOpeningHours(updateDto.getOpeningHours());
        }
        if (updateDto.getPriceRange() != null) {
            hotel.setPriceRange(updateDto.getPriceRange());
        }
        if (updateDto.getAmenities() != null) {
            hotel.setAmenities(updateDto.getAmenities());
        }
        if (updateDto.getAvailabilityStatus() != null) {
            hotel.setAvailabilityStatus(updateDto.getAvailabilityStatus());
        }

        Place updatedHotel = placeRepository.save(hotel);
        return PlaceMapper.toPlaceDetailsDto(updatedHotel);
    }

    @Override
    @Transactional
    public void deleteHotel(Long hotelId) {
        Place hotel = placeRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        if (hotel.getCategory() != PlaceCategory.HOTEL) {
            throw new IllegalStateException("Place with id " + hotelId + " is not a hotel");
        }

        // Soft delete
        hotel.setDeleted(true);
        hotel.setDeletedAt(LocalDateTime.now());
        placeRepository.save(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponseDto getHotelById(Long hotelId) {
        Place hotel = placeRepository.findByIdAndDeletedFalse(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        if (hotel.getCategory() != PlaceCategory.HOTEL) {
            throw new IllegalStateException("Place with id " + hotelId + " is not a hotel");
        }

        return HotelMapper.toHotelResponseDto(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> searchHotels(HotelSearchRequestDto request) {
        // If location-based search with coordinates
        if (request.getLatitude() != null && request.getLongitude() != null && request.getRadius() != null) {
            return searchHotelsWithLocation(request);
        }

        // If city-based search
        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            return searchHotelsByCity(request);
        }

        // If price range only
        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            return searchHotelsByPrice(request);
        }

        // If rating filter only
        if (request.getMinRating() != null) {
            return searchHotelsByRating(request);
        }

        // Default: return all available hotels
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> hotels = placeRepository.findByCategoryAndAvailabilityStatusAndDeletedFalse(
                PlaceCategory.HOTEL, request.getAvailableOnly(), pageable);
        return hotels.map(HotelMapper::toHotelResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> findNearbyHotels(Double lat, Double lon, Double radius,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, int page, int size) {
        HotelSearchRequestDto request = HotelSearchRequestDto.builder()
                .latitude(lat)
                .longitude(lon)
                .radius(radius)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .page(page)
                .size(size)
                .build();

        return searchHotelsWithLocation(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> findHotelsByCity(String city, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Place> hotels = placeRepository.findByCategoryAndCityContainingIgnoreCaseAndDeletedFalse(
                PlaceCategory.HOTEL, city, pageable);
        return hotels.map(HotelMapper::toHotelResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> filterByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Place> hotels = placeRepository.findByCategoryAndPricePerNightBetweenAndDeletedFalse(
                PlaceCategory.HOTEL, minPrice, maxPrice, pageable);
        return hotels.map(HotelMapper::toHotelResponseDto);
    }

    // Helper methods

    private Page<HotelResponseDto> searchHotelsWithLocation(HotelSearchRequestDto request) {
        // Calculate bounding box for efficient filtering
        double latDelta = request.getRadius() / 111.0; // 1 degree latitude ≈ 111 km
        double lonDelta = request.getRadius() / (111.0 * Math.cos(Math.toRadians(request.getLatitude())));

        BigDecimal minLat = BigDecimal.valueOf(request.getLatitude() - latDelta);
        BigDecimal maxLat = BigDecimal.valueOf(request.getLatitude() + latDelta);
        BigDecimal minLon = BigDecimal.valueOf(request.getLongitude() - lonDelta);
        BigDecimal maxLon = BigDecimal.valueOf(request.getLongitude() + lonDelta);

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<Object[]> results = placeRepository.searchHotelsWithFilters(
                request.getLatitude(),
                request.getLongitude(),
                minLat, maxLat, minLon, maxLon,
                request.getRadius(),
                request.getCity(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getMinRating(),
                request.getAvailableOnly(),
                request.getSort(),
                pageable);

        return results.map(HotelMapper::toHotelResponseDtoFromNativeQuery);
    }

    private Page<HotelResponseDto> searchHotelsByCity(HotelSearchRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> hotels = placeRepository.findByCategoryAndCityContainingIgnoreCaseAndDeletedFalse(
                PlaceCategory.HOTEL, request.getCity(), pageable);
        return hotels.map(HotelMapper::toHotelResponseDto);
    }

    private Page<HotelResponseDto> searchHotelsByPrice(HotelSearchRequestDto request) {
        BigDecimal minPrice = request.getMinPrice() != null ? request.getMinPrice() : BigDecimal.ZERO;
        BigDecimal maxPrice = request.getMaxPrice() != null ? request.getMaxPrice() : new BigDecimal("999999.99");

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> hotels = placeRepository.findByCategoryAndPricePerNightBetweenAndDeletedFalse(
                PlaceCategory.HOTEL, minPrice, maxPrice, pageable);
        return hotels.map(HotelMapper::toHotelResponseDto);
    }

    private Page<HotelResponseDto> searchHotelsByRating(HotelSearchRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> hotels = placeRepository.findByCategoryAndRatingGreaterThanEqualAndDeletedFalse(
                PlaceCategory.HOTEL, request.getMinRating(), pageable);
        return hotels.map(HotelMapper::toHotelResponseDto);
    }
}
