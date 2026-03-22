package SmartTourismGuide.app.dto.request;

import SmartTourismGuide.app.enums.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateRoomDto {

    @NotNull
    private Long hotelId;

    @NotNull
    private RoomType roomType;

    @Min(1)
    private Integer totalRooms = 1;

    @NotNull
    private BigDecimal pricePerNight;

    private String description;

    private String amenities; // JSON string
}
