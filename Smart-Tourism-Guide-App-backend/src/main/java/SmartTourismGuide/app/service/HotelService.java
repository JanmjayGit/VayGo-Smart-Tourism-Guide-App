package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import org.springframework.data.domain.Page;

public interface HotelService {

    PlaceDetailsDto createHotel(CreateHotelDto createDto);
    PlaceDetailsDto updateHotel(Long hotelId, UpdateHotelDto updateDto);
    void deleteHotel(Long hotelId);
    HotelResponseDto getHotelById(Long hotelId);
    Page<HotelResponseDto> searchHotels(HotelSearchRequestDto request);
    Page<HotelResponseDto> findNearbyHotels(Double lat, Double lon, Double radius,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            java.math.BigDecimal minRating,
            int page, int size);

    Page<HotelResponseDto> findHotelsByCity(String city, int page, int size);

    Page<HotelResponseDto> filterByPriceRange(java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            int page, int size);
}
