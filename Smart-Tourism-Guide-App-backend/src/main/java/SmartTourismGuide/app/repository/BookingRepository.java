//package SmartTourismGuide.app.repository;
//
//import SmartTourismGuide.app.entity.Booking;
//import SmartTourismGuide.app.enums.BookingStatus;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@Repository
//public interface BookingRepository extends JpaRepository<Booking, Long> {
//
//    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
//
//    // Overlap check: existing booking for same room overlaps requested dates
//    @Query("""
//                SELECT COUNT(b) > 0 FROM Booking b
//                WHERE b.room.id = :roomId
//                  AND b.bookingStatus NOT IN ('CANCELLED')
//                  AND b.checkIn < :checkOut
//                  AND b.checkOut > :checkIn
//            """)
//    boolean existsOverlappingBooking(
//            @Param("roomId") Long roomId,
//            @Param("checkIn") LocalDate checkIn,
//            @Param("checkOut") LocalDate checkOut);
//
//    List<Booking> findByUserIdAndBookingStatus(Long userId, BookingStatus status);
//}


package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Booking;
import SmartTourismGuide.app.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    List<Booking> findByUserIdAndBookingStatus(Long userId, BookingStatus status);

    @Query("""
        SELECT COUNT(b)
        FROM Booking b
        WHERE b.room.id = :roomId
          AND b.bookingStatus = SmartTourismGuide.app.enums.BookingStatus.CONFIRMED
          AND b.checkIn < :checkOut
          AND b.checkOut > :checkIn
    """)
    long countConfirmedOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}

