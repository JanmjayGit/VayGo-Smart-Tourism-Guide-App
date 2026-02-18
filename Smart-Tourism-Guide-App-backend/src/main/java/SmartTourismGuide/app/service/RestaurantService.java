package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface RestaurantService {

    PlaceDetailsDto createRestaurant(CreateRestaurantDto createDto);
    PlaceDetailsDto updateRestaurant(Long restaurantId, UpdateRestaurantDto updateDto);
    void deleteRestaurant(Long restaurantId);
    RestaurantResponseDto getRestaurantById(Long restaurantId);
    Page<RestaurantResponseDto> searchRestaurants(RestaurantSearchRequestDto request);
    Page<RestaurantResponseDto> findNearbyRestaurants(Double lat, Double lon, Double radius,
            String cuisineType, String foodCategory,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, int page, int size);

    Page<RestaurantResponseDto> findByCuisine(String cuisineType, int page, int size);
    Page<RestaurantResponseDto> findByFoodCategory(String foodCategory, int page, int size);
    Page<RestaurantResponseDto> findByCity(String city, int page, int size);
}
