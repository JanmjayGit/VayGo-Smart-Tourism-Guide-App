package SmartTourismGuide.app.dto.update;

import SmartTourismGuide.app.enums.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateRoomDto {

    @NotNull
    private RoomType roomType;

    @Min(1)
    private Integer totalRooms = 1;

    @NotNull
    private BigDecimal pricePerNight;

    private String description;

    @Min(1)
    private Integer capacity = 2;

    private List<String> imageUrls;

    private String amenities;
}
