package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.EmergencyServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyServiceDto {

    private Long id;
    private String name;
    private EmergencyServiceCategory category;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
    private String address;
    private String city;
    private String state;
    private Boolean available24x7;
    private String description;

    // Calculated field
    private Double distance; // in kilometers
}
