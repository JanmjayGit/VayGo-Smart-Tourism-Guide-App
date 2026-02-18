package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapMarkerDto {

    private Long id;
    private String name;
    private String category;
    private Double latitude;
    private Double longitude;
    private BigDecimal rating;
    private Integer popularity;
    private String imageUrl;
    private Double distance;
}
