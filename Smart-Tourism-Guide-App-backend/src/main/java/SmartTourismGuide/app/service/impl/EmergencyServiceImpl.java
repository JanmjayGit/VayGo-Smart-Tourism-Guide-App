package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.EmergencyServiceRequest;
import SmartTourismGuide.app.dto.response.EmergencyServiceDto;
import SmartTourismGuide.app.enums.EmergencyServiceCategory;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.EmergencyServiceMapper;
import SmartTourismGuide.app.repository.EmergencyServiceRepository;
import SmartTourismGuide.app.service.EmergencyService;
import SmartTourismGuide.app.entity.EmergencyServiceEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyServiceImpl implements EmergencyService {

    private final EmergencyServiceRepository emergencyServiceRepository;
    private final EmergencyServiceMapper emergencyServiceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyServiceDto> findNearby(
            Double latitude, Double longitude, Double radiusKm,
            EmergencyServiceCategory category, Integer limit) {

        log.info("Finding nearby emergency services: lat={}, lon={}, radius={}km, category={}, limit={}",
                latitude, longitude, radiusKm, category, limit);

        // Validate inputs
        validateLatitude(latitude);
        validateLongitude(longitude);
        validateRadius(radiusKm);

        // Set default limit
        if (limit == null || limit <= 0) {
            limit = 20;
        }
        if (limit > 100) {
            limit = 100; // Max limit
        }

        // Convert category to string for native query
        String categoryStr = category != null ? category.name() : null;

        // Execute native query
        List<Object[]> results = emergencyServiceRepository.findNearbyServices(
                latitude, longitude, radiusKm, categoryStr, limit);

        // Convert results to DTOs
        List<EmergencyServiceDto> dtos = new ArrayList<>();
        for (Object[] row : results) {
            EmergencyServiceEntity entity = mapRowToEntity(row);
            Double distance = ((Number) row[row.length - 1]).doubleValue();

            EmergencyServiceDto dto = emergencyServiceMapper.toDtoWithDistance(entity, distance);
            dtos.add(dto);
        }

        log.info("Found {} nearby emergency services", dtos.size());
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyServiceDto> getAll() {
        return emergencyServiceRepository.findAll()
                .stream()
                .filter(service -> !service.getDeleted())
                .map(emergencyServiceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyServiceDto> findByCategory(EmergencyServiceCategory category) {
        log.info("Finding emergency services by category: {}", category);

        return emergencyServiceRepository.findByCategoryAndDeletedFalse(category)
                .stream()
                .map(emergencyServiceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyServiceDto> findByCity(String city) {
        log.info("Finding emergency services by city: {}", city);

        return emergencyServiceRepository.findByCityAndDeletedFalse(city)
                .stream()
                .map(emergencyServiceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyServiceDto> find24x7Services() {
        log.info("Finding 24x7 emergency services");

        return emergencyServiceRepository.findByAvailable24x7TrueAndDeletedFalse()
                .stream()
                .map(emergencyServiceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmergencyServiceDto getById(Long id) {
        log.info("Getting emergency service by ID: {}", id);

        EmergencyServiceEntity entity = emergencyServiceRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Service", "id", id));

        return emergencyServiceMapper.toDto(entity);
    }

    @Override
    @Transactional
    public EmergencyServiceDto create(EmergencyServiceRequest request) {
        log.info("Creating new emergency service: {}", request.getName());

        EmergencyServiceEntity entity = emergencyServiceMapper.toEntity(request);
        EmergencyServiceEntity saved = emergencyServiceRepository.save(entity);

        log.info("Created emergency service with ID: {}", saved.getId());
        return emergencyServiceMapper.toDto(saved);
    }

    @Override
    @Transactional
    public EmergencyServiceDto update(Long id, EmergencyServiceRequest request) {
        log.info("Updating emergency service ID: {}", id);

        EmergencyServiceEntity entity = emergencyServiceRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Service not found with id : '" + id + "'"));

        emergencyServiceMapper.updateEntity(entity, request);
        EmergencyServiceEntity updated = emergencyServiceRepository.save(entity);

        log.info("Updated emergency service ID: {}", id);
        return emergencyServiceMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting emergency service ID: {}", id);

        EmergencyServiceEntity entity = emergencyServiceRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Service", "id", id));

        entity.setDeleted(true);
        emergencyServiceRepository.save(entity);

        log.info("Deleted emergency service ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countByCategory(EmergencyServiceCategory category) {
        return emergencyServiceRepository.countByCategoryAndDeletedFalse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countByCity(String city) {
        return emergencyServiceRepository.countByCityAndDeletedFalse(city);
    }

    // Map native query result row to entity
    private EmergencyServiceEntity mapRowToEntity(Object[] row) {
        return EmergencyServiceEntity.builder()
                .id(((Number) row[0]).longValue())
                .name((String) row[1])
                .category(EmergencyServiceCategory.valueOf((String) row[2]))
                .phone((String) row[3])
                .email((String) row[4])
                .latitude((BigDecimal) row[5])
                .longitude((BigDecimal) row[6])
                .address((String) row[7])
                .city((String) row[8])
                .state((String) row[9])
                .available24x7(convertToBoolean(row[10]))
                .description((String) row[11])
                .deleted(convertToBoolean(row[12]))
                .build();
    }

    // Helper method to convert MySQL TINYINT to Boolean
    private Boolean convertToBoolean(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue() != 0;
        }
        return false;
    }

    // Helper function
    private void validateLatitude(Double lat) {
        if (lat == null || lat < -90.0 || lat > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
    }

    private void validateLongitude(Double lon) {
        if (lon == null || lon < -180.0 || lon > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
    }

    private void validateRadius(Double radius) {
        if (radius == null || radius <= 0 || radius > 50) {
            throw new IllegalArgumentException("Radius must be between 0 and 50 km");
        }
    }
}
