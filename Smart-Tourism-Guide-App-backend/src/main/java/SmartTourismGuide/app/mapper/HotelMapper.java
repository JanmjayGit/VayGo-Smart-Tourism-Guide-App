package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.response.HotelResponseDto;
import SmartTourismGuide.app.dto.response.RoomResponseDto;
import SmartTourismGuide.app.entity.Hotel;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.entity.Room;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class HotelMapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();


    public static HotelResponseDto toHotelResponseDto(Hotel hotel, Double distance, List<Room> rooms) {
        return HotelResponseDto.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .city(hotel.getCity())
                .address(hotel.getAddress())
                .description(hotel.getDescription())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .pricePerNight(hotel.getPricePerNight())
                .rating(hotel.getRating())
                .imageUrl(hotel.getImageUrl())
                .imageUrls(hotel.getImageUrls() != null ? hotel.getImageUrls() : Collections.emptyList())
                .amenities(parseAmenities(hotel.getAmenities()))
                .availabilityStatus(hotel.getAvailabilityStatus())
                .verified(hotel.getVerified())
                .distance(distance)
                .rooms(rooms != null ? rooms.stream()
                        .map(HotelMapper::toRoomResponseDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static HotelResponseDto toHotelResponseDto(Hotel hotel, Double distance) {
        return toHotelResponseDto(hotel, distance, null);
    }

    public static HotelResponseDto toHotelResponseDto(Hotel hotel) {
        return toHotelResponseDto(hotel, null, null);
    }

    // ── Place entity overloads (kept for PlaceServiceImpl / map support) ──────

    public static HotelResponseDto toHotelResponseDto(Place place, Double distance, List<Room> rooms) {
        return HotelResponseDto.builder()
                .id(place.getId())
                .name(place.getName())
                .city(place.getCity())
                .address(place.getAddress())
                .description(place.getDescription())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .pricePerNight(place.getPricePerNight())
                .rating(place.getRating())
                .imageUrl(place.getImageUrl())
                .imageUrls(place.getImageUrls() != null ? place.getImageUrls() : Collections.emptyList())
                .amenities(parseAmenities(place.getAmenities()))
                .availabilityStatus(place.getAvailabilityStatus())
                .verified(place.getVerified())
                .distance(distance)
                .rooms(rooms != null ? rooms.stream()
                        .map(HotelMapper::toRoomResponseDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static HotelResponseDto toHotelResponseDto(Place place, Double distance) {
        return toHotelResponseDto(place, distance, null);
    }

    public static HotelResponseDto toHotelResponseDto(Place place) {
        return toHotelResponseDto(place, null, null);
    }

    // Room mapping
    public static RoomResponseDto toRoomResponseDto(Room room) {
        return RoomResponseDto.builder()
                .id(room.getId())
                .roomType(room.getRoomType().name())
                .totalRooms(room.getTotalRooms())
                .availableRooms(room.getAvailableRooms())
                .pricePerNight(room.getPricePerNight())
                .description(room.getDescription())
                .available(room.getAvailableRooms() > 0)
                .build();
    }

    // ── Native query mapper (columns must match HotelRepository.searchNearby
    // SELECT) ──
    // [0]=id, [1]=name, [2]=city, [3]=lat, [4]=lon, [5]=price, [6]=rating,
    // [7]=amenities, [8]=availStatus, [9]=distance
    public static HotelResponseDto toHotelResponseDtoFromNativeQuery(Object[] result) {

        Long id = ((Number) result[0]).longValue();
        String name = (String) result[1];
        String city = (String) result[2];
        BigDecimal latitude = (BigDecimal) result[3];
        BigDecimal longitude = (BigDecimal) result[4];

        BigDecimal pricePerNight =
                result[5] != null ? new BigDecimal(result[5].toString()) : null;

        BigDecimal rating =
                result[6] != null ? new BigDecimal(result[6].toString()) : null;

        String amenitiesJson = (String) result[7];

        Boolean availabilityStatus =
                result[8] != null ? (Boolean) result[8] : true;

        String imageUrl = (String) result[9];

        Double distance =
                result[10] != null ? ((Number) result[10]).doubleValue() : null;

        return HotelResponseDto.builder()
                .id(id)
                .name(name)
                .city(city)
                .latitude(latitude)
                .longitude(longitude)
                .pricePerNight(pricePerNight)
                .rating(rating)
                .imageUrl(imageUrl)
                .imageUrls(Collections.emptyList())
                .amenities(parseAmenities(amenitiesJson))
                .availabilityStatus(availabilityStatus)
                .distance(distance)
                .verified(true)
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
            return new ArrayList<>();
        }
    }
}
