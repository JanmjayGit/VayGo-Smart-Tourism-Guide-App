package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.entity.Hotel;
import SmartTourismGuide.app.entity.Room;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.HotelMapper;
import SmartTourismGuide.app.repository.HotelRepository;
import SmartTourismGuide.app.repository.RoomRepository;
import SmartTourismGuide.app.repository.UserRepository;
import SmartTourismGuide.app.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    // create Hotel
    @Override
    @Transactional
    public HotelResponseDto createHotel(CreateHotelDto dto) {
        Hotel hotel = buildHotelFromDto(dto);
        hotel.setVerified(true); // admin-created → immediately verified
        hotel.setAvailabilityStatus(true);
        Hotel saved = hotelRepository.save(hotel);
        return withRooms(saved, null);
    }

    @Override
    @Transactional
    public HotelResponseDto requestHotel(CreateHotelDto dto) {
        Hotel hotel = buildHotelFromDto(dto);
        hotel.setVerified(false); // user-submitted → needs approval
        hotel.setAvailabilityStatus(false);
//        hotel.setSubmittedByUserId(userId);
        Hotel saved = hotelRepository.save(hotel);
//        return HotelMapper.toHotelResponseDto(saved);
        return withRooms(saved, null);
    }

    // update Hotel
    @Override
    @Transactional
    public HotelResponseDto updateHotel(Long hotelId, UpdateHotelDto dto) {
        Hotel hotel = hotelRepository.findByIdAndDeletedFalse(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        if (dto.getName() != null)
            hotel.setName(dto.getName());
        if (dto.getDescription() != null)
            hotel.setDescription(dto.getDescription());
        if (dto.getCity() != null)
            hotel.setCity(dto.getCity());
        if (dto.getAddress() != null)
            hotel.setAddress(dto.getAddress());
        if (dto.getLatitude() != null)
            hotel.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null)
            hotel.setLongitude(dto.getLongitude());
        if (dto.getPricePerNight() != null)
            hotel.setPricePerNight(dto.getPricePerNight());
        if (dto.getRating() != null)
            hotel.setRating(dto.getRating());
        if (dto.getImageUrl() != null)
            hotel.setImageUrl(dto.getImageUrl());
        if (dto.getContactInfo() != null)
            hotel.setContactInfo(dto.getContactInfo());
        if (dto.getOpeningHours() != null)
            hotel.setOpeningHours(dto.getOpeningHours());
        if (dto.getPriceRange() != null)
            hotel.setPriceRange(dto.getPriceRange() != null
                    ? dto.getPriceRange().toString()
                    : null);
        if (dto.getAmenities() != null)
            hotel.setAmenities(dto.getAmenities());
        if (dto.getAvailabilityStatus() != null)
            hotel.setAvailabilityStatus(dto.getAvailabilityStatus());
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            hotel.setImageUrls(dto.getImageUrls());
            hotel.setImageUrl(dto.getImageUrls().get(0)); // primary
        }

        Hotel updated = hotelRepository.save(hotel);
        return withRooms(updated, null);
    }

    // ─── Delete

    @Override
    @Transactional
    public void deleteHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findByIdAndDeletedFalse(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
        hotel.setDeleted(true);
        hotel.setDeletedAt(LocalDateTime.now());
        hotelRepository.save(hotel);
    }

    // Read (single)
    @Override
    @Transactional(readOnly = true)
    public HotelResponseDto getHotelById(Long hotelId) {
        Hotel hotel = hotelRepository.findByIdAndDeletedFalse(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
//        return HotelMapper.toHotelResponseDto(hotel, null, rooms);
        return withRooms(hotel, null);
    }

    //Search Hotels
    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> searchHotels(HotelSearchRequestDto request) {
        if (request.getLatitude() != null && request.getLongitude() != null
                && request.getRadius() != null) {
            return searchHotelsWithLocation(request);
        }
        if (request.getCity() != null && !request.getCity().isBlank()) {
            return searchHotelsByCity(request);
        }
        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            return searchHotelsByPrice(request);
        }
        if (request.getMinRating() != null) {
            return searchHotelsByRating(request);
        }
        // Default: all available verified hotels
        Pageable p = PageRequest.of(request.getPage(), request.getSize());
        Boolean available = request.getAvailableOnly() != null ? request.getAvailableOnly() : true;
        return hotelRepository
                .findByAvailabilityStatusAndDeletedFalseAndVerifiedTrue(available, p)
                .map(hotel -> withRooms(hotel, null));
//                .map(HotelMapper::toHotelResponseDto);

    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> findNearbyHotels(Double lat, Double lon, Double radius,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, int page, int size) {
        HotelSearchRequestDto req = HotelSearchRequestDto.builder()
                .latitude(lat)
                .longitude(lon)
                .radius(radius)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .page(page)
                .size(size)
                .build();
        return searchHotelsWithLocation(req);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> findHotelsByCity(String city, int page, int size) {
        Pageable p = PageRequest.of(page, size);
        return hotelRepository
                .findByCityContainingIgnoreCaseAndDeletedFalseAndVerifiedTrue(city, p)
                .map(hotel -> withRooms(hotel, null));
//                .map(HotelMapper::toHotelResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> filterByPriceRange(BigDecimal minPrice, BigDecimal maxPrice,
            int page, int size) {
        Pageable p = PageRequest.of(page, size);
        BigDecimal lo = minPrice != null ? minPrice : BigDecimal.ZERO;
        BigDecimal hi = maxPrice != null ? maxPrice : new BigDecimal("999999.99");
        return hotelRepository
                .findByPricePerNightBetweenAndDeletedFalseAndVerifiedTrue(lo, hi, p)
                .map(hotel -> withRooms(hotel, null));
//                .map(HotelMapper::toHotelResponseDto);
    }

    // helper functions
    private Hotel buildHotelFromDto(CreateHotelDto dto) {
        Hotel hotel = new Hotel();
        hotel.setName(dto.getName());
        hotel.setDescription(dto.getDescription());
        hotel.setCity(dto.getCity());
        hotel.setAddress(dto.getAddress());
        hotel.setContactInfo(dto.getContactInfo());
        hotel.setOpeningHours(dto.getOpeningHours());
        hotel.setLatitude(dto.getLatitude() != null ? dto.getLatitude() : BigDecimal.ZERO);
        hotel.setLongitude(dto.getLongitude() != null ? dto.getLongitude() : BigDecimal.ZERO);
        hotel.setPricePerNight(dto.getPricePerNight());
        hotel.setRating(dto.getRating());
//        hotel.setImageUrl(dto.getImageUrl());
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            hotel.setImageUrl(dto.getImageUrls().get(0));
            hotel.setImageUrls(dto.getImageUrls());
        } else {
            hotel.setImageUrl(dto.getImageUrl());
        }
        hotel.setAmenities(dto.getAmenities() != null ? dto.getAmenities() : "[]");
        hotel.setDeleted(false);
        hotel.setPopularity(0L);
        return hotel;
    }

//    private HotelResponseDto withRooms(Hotel hotel, Double distance) {
//        List<Room> rooms = roomRepository.findByHotelId(hotel.getId());
//        return HotelMapper.toHotelResponseDto(hotel, distance, rooms);
//    }
    private HotelResponseDto withRooms(Hotel hotel, Double distance) {

        List<Room> rooms = roomRepository.findByHotelId(hotel.getId());

        HotelResponseDto dto = HotelMapper.toHotelResponseDto(hotel, distance, rooms);

        // Resolve username
        String username = "Admin";

        if (hotel.getSubmittedByUserId() != null) {
            username = userRepository
                    .findById(hotel.getSubmittedByUserId())
                    .map(user -> user.getUsername())
                    .orElse("Unknown");
        }

        dto.setSubmittedByUsername(username);

        return dto;
    }

    private Page<HotelResponseDto> searchHotelsWithLocation(HotelSearchRequestDto req) {
        double latDelta = req.getRadius() / 111.0;
        double lonDelta = req.getRadius() / (111.0 * Math.cos(Math.toRadians(req.getLatitude())));

        BigDecimal minLat = BigDecimal.valueOf(req.getLatitude() - latDelta);
        BigDecimal maxLat = BigDecimal.valueOf(req.getLatitude() + latDelta);
        BigDecimal minLon = BigDecimal.valueOf(req.getLongitude() - lonDelta);
        BigDecimal maxLon = BigDecimal.valueOf(req.getLongitude() + lonDelta);

        Pageable p = PageRequest.of(req.getPage(), req.getSize());
        String sortBy = req.getSort() != null ? req.getSort() : "distance";

        Page<Object[]> results = hotelRepository.searchNearby(
                req.getLatitude(), req.getLongitude(),
                minLat, maxLat, minLon, maxLon,
                req.getRadius(),
                req.getCity(),
                req.getMinPrice(), req.getMaxPrice(), req.getMinRating(),
                req.getAvailableOnly() != null ? req.getAvailableOnly() : true,
                sortBy, p);

        return results.map(HotelMapper::toHotelResponseDtoFromNativeQuery);
    }

    private Page<HotelResponseDto> searchHotelsByCity(HotelSearchRequestDto req) {
        Pageable p = PageRequest.of(req.getPage(), req.getSize());
        return hotelRepository
                .findByCityContainingIgnoreCaseAndDeletedFalseAndVerifiedTrue(req.getCity(), p)
                .map(hotel -> withRooms(hotel, null));
//                .map(HotelMapper::toHotelResponseDto);
    }

    private Page<HotelResponseDto> searchHotelsByPrice(HotelSearchRequestDto req) {
        BigDecimal lo = req.getMinPrice() != null ? req.getMinPrice() : BigDecimal.ZERO;
        BigDecimal hi = req.getMaxPrice() != null ? req.getMaxPrice() : new BigDecimal("999999.99");
        Pageable p = PageRequest.of(req.getPage(), req.getSize());
        return hotelRepository
                .findByPricePerNightBetweenAndDeletedFalseAndVerifiedTrue(lo, hi, p)
                .map(hotel -> withRooms(hotel, null));
//                .map(HotelMapper::toHotelResponseDto);
    }

    private Page<HotelResponseDto> searchHotelsByRating(HotelSearchRequestDto req) {
        Pageable p = PageRequest.of(req.getPage(), req.getSize());
        return hotelRepository
                .findByRatingGreaterThanEqualAndDeletedFalseAndVerifiedTrue(req.getMinRating(), p)
                .map(hotel -> withRooms(hotel, null));
//                .map(HotelMapper::toHotelResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponseDto> getHotelsWithUser(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Object[]> results = hotelRepository.findHotelsWithUser(pageable);

        return results.map(result -> {

            Hotel hotel = (Hotel) result[0];
            String username = (String) result[1];

            HotelResponseDto dto = HotelMapper.toHotelResponseDto(hotel);

            dto.setSubmittedByUsername(
                    username != null ? username : "Admin"
            );

            return dto;
        });
    }
}
