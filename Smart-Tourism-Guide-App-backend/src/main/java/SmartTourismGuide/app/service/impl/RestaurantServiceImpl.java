package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceCategory;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.PlaceMapper;
import SmartTourismGuide.app.mapper.RestaurantMapper;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.service.RestaurantService;
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
public class RestaurantServiceImpl implements RestaurantService {

    private final PlaceRepository placeRepository;

    @Override
    @Transactional
    public PlaceDetailsDto createRestaurant(CreateRestaurantDto createDto) {
        Place restaurant = new Place();
        restaurant.setName(createDto.getName());
        restaurant.setDescription(createDto.getDescription());
        restaurant.setCategory(PlaceCategory.RESTAURANT); // Always set to RESTAURANT
        restaurant.setLatitude(createDto.getLatitude());
        restaurant.setLongitude(createDto.getLongitude());
        restaurant.setCity(createDto.getCity());
        restaurant.setAddress(createDto.getAddress());
        restaurant.setCuisineType(createDto.getCuisineType());
        restaurant.setFoodCategory(createDto.getFoodCategory());
        restaurant.setPricePerNight(createDto.getAvgPriceForTwo()); // Reuse pricePerNight field
        restaurant.setRating(createDto.getRating());
        restaurant.setImageUrl(createDto.getImageUrl());
        restaurant.setContactInfo(createDto.getContactInfo());
        restaurant.setOpeningHours(createDto.getOpeningHours());
        restaurant.setPriceRange(createDto.getPriceRange());
        restaurant.setPopularDishes(createDto.getPopularDishes());
        restaurant.setAmenities(createDto.getAmenities());
        restaurant.setAvailabilityStatus(createDto.getActive());
        restaurant.setPopularity(0L);
        restaurant.setDeleted(false);

        Place savedRestaurant = placeRepository.save(restaurant);
        return PlaceMapper.toPlaceDetailsDto(savedRestaurant);
    }

    @Override
    @Transactional
    public PlaceDetailsDto updateRestaurant(Long restaurantId, UpdateRestaurantDto updateDto) {
        Place restaurant = placeRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        if (restaurant.getCategory() != PlaceCategory.RESTAURANT) {
            throw new IllegalStateException("Place with id " + restaurantId + " is not a restaurant");
        }

        // Update only non-null fields
        if (updateDto.getName() != null)
            restaurant.setName(updateDto.getName());
        if (updateDto.getDescription() != null)
            restaurant.setDescription(updateDto.getDescription());
        if (updateDto.getLatitude() != null)
            restaurant.setLatitude(updateDto.getLatitude());
        if (updateDto.getLongitude() != null)
            restaurant.setLongitude(updateDto.getLongitude());
        if (updateDto.getCity() != null)
            restaurant.setCity(updateDto.getCity());
        if (updateDto.getAddress() != null)
            restaurant.setAddress(updateDto.getAddress());
        if (updateDto.getCuisineType() != null)
            restaurant.setCuisineType(updateDto.getCuisineType());
        if (updateDto.getFoodCategory() != null)
            restaurant.setFoodCategory(updateDto.getFoodCategory());
        if (updateDto.getAvgPriceForTwo() != null)
            restaurant.setPricePerNight(updateDto.getAvgPriceForTwo());
        if (updateDto.getRating() != null)
            restaurant.setRating(updateDto.getRating());
        if (updateDto.getImageUrl() != null)
            restaurant.setImageUrl(updateDto.getImageUrl());
        if (updateDto.getContactInfo() != null)
            restaurant.setContactInfo(updateDto.getContactInfo());
        if (updateDto.getOpeningHours() != null)
            restaurant.setOpeningHours(updateDto.getOpeningHours());
        if (updateDto.getPriceRange() != null)
            restaurant.setPriceRange(updateDto.getPriceRange());
        if (updateDto.getPopularDishes() != null)
            restaurant.setPopularDishes(updateDto.getPopularDishes());
        if (updateDto.getAmenities() != null)
            restaurant.setAmenities(updateDto.getAmenities());
        if (updateDto.getActive() != null)
            restaurant.setAvailabilityStatus(updateDto.getActive());

        Place updatedRestaurant = placeRepository.save(restaurant);
        return PlaceMapper.toPlaceDetailsDto(updatedRestaurant);
    }

    @Override
    @Transactional
    public void deleteRestaurant(Long restaurantId) {
        Place restaurant = placeRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        if (restaurant.getCategory() != PlaceCategory.RESTAURANT) {
            throw new IllegalStateException("Place with id " + restaurantId + " is not a restaurant");
        }

        // Soft delete
        restaurant.setDeleted(true);
        restaurant.setDeletedAt(LocalDateTime.now());
        placeRepository.save(restaurant);
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantResponseDto getRestaurantById(Long restaurantId) {
        Place restaurant = placeRepository.findByIdAndDeletedFalse(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        if (restaurant.getCategory() != PlaceCategory.RESTAURANT) {
            throw new IllegalStateException("Place with id " + restaurantId + " is not a restaurant");
        }

        return RestaurantMapper.toRestaurantResponseDto(restaurant);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponseDto> searchRestaurants(RestaurantSearchRequestDto request) {
        // Location-based search with coordinates
        if (request.getLatitude() != null && request.getLongitude() != null && request.getRadius() != null) {
            return searchRestaurantsWithLocation(request);
        }

        // City + cuisine search
        if (request.getCity() != null && request.getCuisineType() != null) {
            return searchByCityAndCuisine(request);
        }

        // Cuisine only
        if (request.getCuisineType() != null) {
            return searchByCuisine(request);
        }

        // Food category only
        if (request.getFoodCategory() != null) {
            return searchByFoodCategory(request);
        }

        // City only
        if (request.getCity() != null) {
            return searchByCity(request);
        }

        // Default: return all active restaurants
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> restaurants = placeRepository.findByCategoryAndAvailabilityStatusAndDeletedFalse(
                PlaceCategory.RESTAURANT, request.getActiveOnly(), pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponseDto> findNearbyRestaurants(Double lat, Double lon, Double radius,
            String cuisineType, String foodCategory,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, int page, int size) {
        RestaurantSearchRequestDto request = RestaurantSearchRequestDto.builder()
                .latitude(lat)
                .longitude(lon)
                .radius(radius)
                .cuisineType(cuisineType)
                .foodCategory(foodCategory)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .page(page)
                .size(size)
                .build();

        return searchRestaurantsWithLocation(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponseDto> findByCuisine(String cuisineType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Place> restaurants = placeRepository.findByCategoryAndCuisineTypeAndDeletedFalse(
                PlaceCategory.RESTAURANT, cuisineType, pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponseDto> findByFoodCategory(String foodCategory, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Place> restaurants = placeRepository.findByCategoryAndFoodCategoryAndDeletedFalse(
                PlaceCategory.RESTAURANT, foodCategory, pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponseDto> findByCity(String city, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Place> restaurants = placeRepository.findByCategoryAndCityContainingIgnoreCaseAndDeletedFalse(
                PlaceCategory.RESTAURANT, city, pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    // Helper methods

    private Page<RestaurantResponseDto> searchRestaurantsWithLocation(RestaurantSearchRequestDto request) {
        // Calculate bounding box for efficient filtering
        double latDelta = request.getRadius() / 111.0;
        double lonDelta = request.getRadius() / (111.0 * Math.cos(Math.toRadians(request.getLatitude())));

        BigDecimal minLat = BigDecimal.valueOf(request.getLatitude() - latDelta);
        BigDecimal maxLat = BigDecimal.valueOf(request.getLatitude() + latDelta);
        BigDecimal minLon = BigDecimal.valueOf(request.getLongitude() - lonDelta);
        BigDecimal maxLon = BigDecimal.valueOf(request.getLongitude() + lonDelta);

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<Object[]> results = placeRepository.searchRestaurantsWithFilters(
                request.getLatitude(),
                request.getLongitude(),
                minLat, maxLat, minLon, maxLon,
                request.getRadius(),
                request.getCity(),
                request.getCuisineType(),
                request.getFoodCategory(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getMinRating(),
                request.getActiveOnly(),
                request.getSort(),
                pageable);

        return results.map(RestaurantMapper::toRestaurantResponseDtoFromNativeQuery);
    }

    private Page<RestaurantResponseDto> searchByCityAndCuisine(RestaurantSearchRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> restaurants = placeRepository.findByCategoryAndCityAndCuisineTypeAndDeletedFalse(
                PlaceCategory.RESTAURANT, request.getCity(), request.getCuisineType(), pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    private Page<RestaurantResponseDto> searchByCuisine(RestaurantSearchRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> restaurants = placeRepository.findByCategoryAndCuisineTypeAndDeletedFalse(
                PlaceCategory.RESTAURANT, request.getCuisineType(), pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    private Page<RestaurantResponseDto> searchByFoodCategory(RestaurantSearchRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> restaurants = placeRepository.findByCategoryAndFoodCategoryAndDeletedFalse(
                PlaceCategory.RESTAURANT, request.getFoodCategory(), pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }

    private Page<RestaurantResponseDto> searchByCity(RestaurantSearchRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Place> restaurants = placeRepository.findByCategoryAndCityContainingIgnoreCaseAndDeletedFalse(
                PlaceCategory.RESTAURANT, request.getCity(), pageable);
        return restaurants.map(RestaurantMapper::toRestaurantResponseDto);
    }
}
