package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.response.CoordinateDto;
import SmartTourismGuide.app.dto.response.PlaceDetailsDto;
import SmartTourismGuide.app.dto.response.PlaceDto;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceCategory;

import java.math.BigDecimal;

public class PlaceMapper {

    public static PlaceDto toPlaceDto(Place place, Double distance) {
        return PlaceDto.builder()
                .id(place.getId())
                .name(place.getName())
                .category(place.getCategory())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .distance(distance)
                .rating(place.getRating())
                .imageUrl(place.getImageUrl())
                .priceRange(place.getPriceRange())
                .address(place.getAddress())
                .build();
    }

    public static PlaceDto toPlaceDtoFromNativeQuery(Object[] result) {
        Long id = ((Number) result[0]).longValue();
        String name = (String) result[1];
        // String description = (String) result[2];
        String category = (String) result[3];
        BigDecimal latitude = (BigDecimal) result[4];
        BigDecimal longitude = (BigDecimal) result[5];
        String address = (String) result[6];
        BigDecimal rating = result[7] != null ? (BigDecimal) result[7] : null;
        // Long popularity = result[8] != null ? ((Number) result[8]).longValue() : 0L;
        String imageUrl = (String) result[9];
        // String contactInfo = (String) result[10];
        // String openingHours = (String) result[11];
        Integer priceRange = result[12] != null ? ((Number) result[12]).intValue() : null;

        // Distance is now at index 13 because we explicitly selected columns without
        // timestamps
        Double distance = ((Number) result[13]).doubleValue();

        return PlaceDto.builder()
                .id(id)
                .name(name)
                .category(PlaceCategory.valueOf(category))
                .latitude(latitude)
                .longitude(longitude)
                .distance(distance)
                .rating(rating)
                .imageUrl(imageUrl)
                .priceRange(priceRange)
                .address(address)
                .build();
    }

    public static PlaceDetailsDto toPlaceDetailsDto(Place place) {
        return PlaceDetailsDto.builder()
                .id(place.getId())
                .name(place.getName())
                .description(place.getDescription())
                .category(place.getCategory())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .address(place.getAddress())
                .rating(place.getRating())
                .popularity(place.getPopularity())
                .imageUrl(place.getImageUrl())
                .contactInfo(place.getContactInfo())
                .openingHours(place.getOpeningHours())
                .priceRange(place.getPriceRange())
                .createdAt(place.getCreatedAt())
                .updatedAt(place.getUpdatedAt())
                .build();
    }

    public static CoordinateDto toCoordinateDto(Place place) {
        return CoordinateDto.builder()
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .placeName(place.getName())
                .address(place.getAddress())
                .build();
    }


    public static CoordinateDto toCoordinateDto(BigDecimal latitude, BigDecimal longitude) {
        return CoordinateDto.builder()
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }
}
