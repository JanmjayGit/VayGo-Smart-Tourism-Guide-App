package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Room;
import SmartTourismGuide.app.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    Optional<Room> findByHotelIdAndRoomType(Long hotelId, RoomType roomType);

    List<Room> findByHotelIdAndAvailableRoomsGreaterThan(Long hotelId, int minAvailable);
}
