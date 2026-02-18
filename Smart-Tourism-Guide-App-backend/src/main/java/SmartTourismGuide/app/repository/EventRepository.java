package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Event;
import SmartTourismGuide.app.enums.EventCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

        Optional<Event> findByIdAndDeletedFalse(Long id);

        @Query("SELECT e FROM Event e WHERE e.deleted = false " +
                        "AND e.eventDate >= :today ORDER BY e.eventDate ASC")
        Page<Event> findUpcomingEvents(@Param("today") LocalDate today, Pageable pageable);

        @Query("SELECT e FROM Event e WHERE e.deleted = false " +
                        "AND e.eventDate = :today ORDER BY e.eventTime ASC")
        Page<Event> findCurrentEvents(@Param("today") LocalDate today, Pageable pageable);

        @Query("SELECT e FROM Event e WHERE e.deleted = false " +
                        "AND e.eventDate BETWEEN :startDate AND :endDate " +
                        "ORDER BY e.eventDate ASC")
        Page<Event> findEventsByDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);

        @Query("SELECT e FROM Event e WHERE e.deleted = false " +
                        "AND LOWER(e.city) = LOWER(:city) " +
                        "AND e.eventDate >= :today ORDER BY e.eventDate ASC")
        Page<Event> findEventsByCity(
                        @Param("city") String city,
                        @Param("today") LocalDate today,
                        Pageable pageable);

        @Query("SELECT e FROM Event e WHERE e.deleted = false " +
                        "AND e.category = :category " +
                        "AND e.eventDate >= :today ORDER BY e.eventDate ASC")
        Page<Event> findEventsByCategory(
                        @Param("category") EventCategory category,
                        @Param("today") LocalDate today,
                        Pageable pageable);

        @Query(value = "SELECT *, " +
                        "(6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
                        "cos(radians(longitude) - radians(:lon)) + " +
                        "sin(radians(:lat)) * sin(radians(latitude)))) AS distance " +
                        "FROM events WHERE deleted = false " +
                        "AND event_date >= :today " +
                        "AND latitude IS NOT NULL AND longitude IS NOT NULL " +
                        "HAVING distance <= :radiusKm " +
                        "ORDER BY distance, event_date", nativeQuery = true)
        List<Event> findNearbyEvents(
                        @Param("lat") Double lat,
                        @Param("lon") Double lon,
                        @Param("radiusKm") Double radiusKm,
                        @Param("today") LocalDate today);

        @Query("SELECT e FROM Event e WHERE e.deleted = false " +
                        "AND (:city IS NULL OR LOWER(e.city) = LOWER(:city)) " +
                        "AND (:category IS NULL OR e.category = :category) " +
                        "AND (:startDate IS NULL OR e.eventDate >= :startDate) " +
                        "AND (:endDate IS NULL OR e.eventDate <= :endDate) " +
                        "ORDER BY e.eventDate ASC")
        Page<Event> searchEvents(
                        @Param("city") String city,
                        @Param("category") EventCategory category,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);


        @Query("SELECT e FROM Event e WHERE e.deleted = false AND e.eventDate = :eventDate")
        List<Event> findByEventDate(@Param("eventDate") LocalDate eventDate);

        @Modifying
        @Query("UPDATE Event e SET e.deleted = false WHERE e.id = :id")
        void restore(@Param("id") Long id);
}
