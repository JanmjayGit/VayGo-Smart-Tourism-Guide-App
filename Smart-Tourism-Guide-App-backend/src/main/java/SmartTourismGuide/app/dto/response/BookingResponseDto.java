package SmartTourismGuide.app.dto.response;

import SmartTourismGuide.app.enums.BookingStatus;
import SmartTourismGuide.app.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String hotelCity;
    private String hotelImageUrl;
    private Long roomId;
    private String roomType;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer totalDays;
    private BigDecimal totalPrice;
    private Integer guests;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
}
