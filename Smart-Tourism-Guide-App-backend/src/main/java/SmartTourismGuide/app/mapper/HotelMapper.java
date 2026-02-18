package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.response.HotelResponseDto;
import SmartTourismGuide.app.entity.Place;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class HotelMapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static HotelResponseDto toHotelResponseDto(Place place, Double distance) {
        return HotelResponseDto.builder()
                .id(place.getId())
                .name(place.getName())
                .city(place.getCity())
                .address(place.getAddress())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .pricePerNight(place.getPricePerNight())
                .rating(place.getRating())
                .imageUrl(place.getImageUrl())
                .amenities(parseAmenities(place.getAmenities()))
                .availabilityStatus(place.getAvailabilityStatus())
                .distance(distance)
                .build();
    }

    public static HotelResponseDto toHotelResponseDto(Place place) {
        return toHotelResponseDto(place, null);
    }

    public static HotelResponseDto toHotelResponseDtoFromNativeQuery(Object[] result) {
        // Order: id, name, city, latitude, longitude, price_per_night,
        // rating, amenities, availability_status, distance

        Long id = ((Number) result[0]).longValue();
        String name = (String) result[1];
        String city = (String) result[2];
        BigDecimal latitude = (BigDecimal) result[3];
        BigDecimal longitude = (BigDecimal) result[4];
        BigDecimal pricePerNight = result[5] != null ? (BigDecimal) result[5] : null;
        BigDecimal rating = result[6] != null ? (BigDecimal) result[6] : null;
        String amenitiesJson = (String) result[7];
        Boolean availabilityStatus = result[8] != null ? (Boolean) result[8] : true;
        Double distance = result[9] != null ? ((Number) result[9]).doubleValue() : null;

        return HotelResponseDto.builder()
                .id(id)
                .name(name)
                .city(city)
                .latitude(latitude)
                .longitude(longitude)
                .pricePerNight(pricePerNight)
                .rating(rating)
                .amenities(parseAmenities(amenitiesJson))
                .availabilityStatus(availabilityStatus)
                .distance(distance)
                .build();
    }

    private static List<String> parseAmenities(String amenitiesJson) {
        if (amenitiesJson == null || amenitiesJson.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            // If parsing fails, return empty list
            return new ArrayList<>();
        }
    }
}
