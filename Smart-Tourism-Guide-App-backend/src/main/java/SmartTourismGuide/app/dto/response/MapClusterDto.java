package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapClusterDto {

    private Double latitude;
    private Double longitude;
    private Integer count;
    private String category;
}
