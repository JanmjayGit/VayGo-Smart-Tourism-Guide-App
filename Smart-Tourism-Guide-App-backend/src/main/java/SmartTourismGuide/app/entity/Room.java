package SmartTourismGuide.app.entity;

import SmartTourismGuide.app.enums.RoomType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "rooms", indexes = {
        @Index(name = "idx_room_hotel", columnList = "hotel_id"),
        @Index(name = "idx_room_type", columnList = "room_type, hotel_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 20)
    private RoomType roomType;

    @Column(nullable = false)
    private Integer totalRooms = 1;

    @Column(nullable = false)
    private Integer availableRooms = 1;

    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String amenities; // JSON array string
}
