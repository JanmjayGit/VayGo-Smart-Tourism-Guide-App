package SmartTourismGuide.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteCheckResponseDto {

    private Long placeId;
    private Boolean isFavorite;
}
