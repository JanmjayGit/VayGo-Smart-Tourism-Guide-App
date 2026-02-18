package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.response.RestaurantResponseDto;
import SmartTourismGuide.app.entity.Place;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RestaurantMapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Convert Place entity to RestaurantResponseDto with distance.
    public static RestaurantResponseDto toRestaurantResponseDto(Place place, Double distance) {
        return RestaurantResponseDto.builder()
                .id(place.getId())
                .name(place.getName())
                .city(place.getCity())
                .address(place.getAddress())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .cuisineType(place.getCuisineType())
                .foodCategory(place.getFoodCategory())
                .avgPriceForTwo(place.getPricePerNight()) // Reusing pricePerNight field
                .rating(place.getRating())
                .imageUrl(place.getImageUrl())
                .popularDishes(parsePopularDishes(place.getPopularDishes()))
                .amenities(parseAmenities(place.getAmenities()))
                .active(!place.getDeleted())
                .distance(distance)
                .build();
    }

     // Convert Place entity to RestaurantResponseDto without distance.
    public static RestaurantResponseDto toRestaurantResponseDto(Place place) {
        return toRestaurantResponseDto(place, null);
    }

    public static RestaurantResponseDto toRestaurantResponseDtoFromNativeQuery(Object[] result) {
        return RestaurantResponseDto.builder()
                .id(((Number) result[0]).longValue())
                .name((String) result[1])
                .city((String) result[2])
                .cuisineType((String) result[3])
                .foodCategory((String) result[4])
                .latitude((BigDecimal) result[5])
                .longitude((BigDecimal) result[6])
                .avgPriceForTwo((BigDecimal) result[7])
                .rating((BigDecimal) result[8])
                .popularDishes(parsePopularDishes((String) result[9]))
                .amenities(parseAmenities((String) result[10]))
                .distance(result[11] != null ? ((Number) result[11]).doubleValue() : null)
                .active(true) // Only active restaurants in search results
                .build();
    }

    private static List<String> parsePopularDishes(String popularDishesJson) {
        if (popularDishesJson == null || popularDishesJson.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(popularDishesJson, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private static List<String> parseAmenities(String amenitiesJson) {
        if (amenitiesJson == null || amenitiesJson.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
