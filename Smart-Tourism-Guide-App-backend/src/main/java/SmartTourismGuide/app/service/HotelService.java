package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface HotelService {

        HotelResponseDto createHotel(CreateHotelDto createDto);

        HotelResponseDto requestHotel(CreateHotelDto createDto, Long userId); // user submission — verified=false

        HotelResponseDto updateHotel(Long hotelId, UpdateHotelDto updateDto);

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

        Page<HotelResponseDto> getHotelsWithUser(int page, int size);

        List<HotelResponseDto> getUserHotels(Long userId);

        HotelResponseDto userEditHotel(Long hotelId, Long userId, UpdateHotelDto dto);
}

