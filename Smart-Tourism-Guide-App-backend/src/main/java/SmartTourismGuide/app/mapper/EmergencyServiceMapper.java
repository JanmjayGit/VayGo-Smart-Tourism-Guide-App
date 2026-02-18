package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.request.EmergencyServiceRequest;
import SmartTourismGuide.app.dto.response.EmergencyServiceDto;
import SmartTourismGuide.app.entity.EmergencyServiceEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EmergencyServiceMapper {

    public EmergencyServiceDto toDto(EmergencyServiceEntity entity) {
        if (entity == null) {
            return null;
        }

        return EmergencyServiceDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .latitude(entity.getLatitude() != null ? entity.getLatitude().doubleValue() : null)
                .longitude(entity.getLongitude() != null ? entity.getLongitude().doubleValue() : null)
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .available24x7(entity.getAvailable24x7())
                .description(entity.getDescription())
                .build();
    }

    // Convert entity to DTO with distance
    public EmergencyServiceDto toDtoWithDistance(EmergencyServiceEntity entity, Double distance) {
        EmergencyServiceDto dto = toDto(entity);
        if (dto != null) {
            dto.setDistance(distance);
        }
        return dto;
    }

    // Convert request DTO to entity
    public EmergencyServiceEntity toEntity(EmergencyServiceRequest request) {
        if (request == null) {
            return null;
        }

        return EmergencyServiceEntity.builder()
                .name(request.getName())
                .category(request.getCategory())
                .phone(request.getPhone())
                .email(request.getEmail())
                .latitude(request.getLatitude() != null ? BigDecimal.valueOf(request.getLatitude()) : null)
                .longitude(request.getLongitude() != null ? BigDecimal.valueOf(request.getLongitude()) : null)
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .available24x7(request.getAvailable24x7())
                .description(request.getDescription())
                .deleted(false)
                .build();
    }

    // Update entity from request DTO
    public void updateEntity(EmergencyServiceEntity entity, EmergencyServiceRequest request) {
        if (entity == null || request == null) {
            return;
        }

        entity.setName(request.getName());
        entity.setCategory(request.getCategory());
        entity.setPhone(request.getPhone());
        entity.setEmail(request.getEmail());
        entity.setLatitude(request.getLatitude() != null ? BigDecimal.valueOf(request.getLatitude()) : null);
        entity.setLongitude(request.getLongitude() != null ? BigDecimal.valueOf(request.getLongitude()) : null);
        entity.setAddress(request.getAddress());
        entity.setCity(request.getCity());
        entity.setState(request.getState());
        entity.setAvailable24x7(request.getAvailable24x7());
        entity.setDescription(request.getDescription());
    }

    // Calculate distance between two points using Haversine formula
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) *
                        Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
