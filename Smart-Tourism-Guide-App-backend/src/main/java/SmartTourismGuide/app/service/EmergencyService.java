package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.EmergencyServiceRequest;
import SmartTourismGuide.app.dto.response.EmergencyServiceDto;
import SmartTourismGuide.app.enums.EmergencyServiceCategory;

import java.util.List;

public interface EmergencyService {

    List<EmergencyServiceDto> findNearby(
            Double latitude, Double longitude, Double radiusKm,
            EmergencyServiceCategory category, Integer limit);

    List<EmergencyServiceDto> getAll();
    List<EmergencyServiceDto> findByCategory(EmergencyServiceCategory category);
    List<EmergencyServiceDto> findByCity(String city);
    List<EmergencyServiceDto> find24x7Services();
    EmergencyServiceDto getById(Long id);
    EmergencyServiceDto create(EmergencyServiceRequest request);
    EmergencyServiceDto update(Long id, EmergencyServiceRequest request);
    void delete(Long id);
    Long countByCategory(EmergencyServiceCategory category);
    Long countByCity(String city);
}
