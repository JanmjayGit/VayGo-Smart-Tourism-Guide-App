package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    // ── Single hotel lookup ─────────────────────────────────────────────────
    Optional<Hotel> findByIdAndDeletedFalse(Long id);

    // ── Public-facing (verified only) ───────────────────────────────────────
    Page<Hotel> findByDeletedFalseAndVerifiedTrue(Pageable pageable);

    Page<Hotel> findByCityContainingIgnoreCaseAndDeletedFalseAndVerifiedTrue(
            String city, Pageable pageable);

    Page<Hotel> findByPricePerNightBetweenAndDeletedFalseAndVerifiedTrue(
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    Page<Hotel> findByRatingGreaterThanEqualAndDeletedFalseAndVerifiedTrue(
            BigDecimal minRating, Pageable pageable);

    Page<Hotel> findByAvailabilityStatusAndDeletedFalseAndVerifiedTrue(
            Boolean available, Pageable pageable);

    // ── Admin-facing (all, including unverified) ────────────────────────────
    Page<Hotel> findByDeletedFalseAndVerifiedFalse(Pageable pageable);

    List<Hotel> findByDeletedFalseAndVerifiedFalse();

    // ── Spatial search (columns ordered to match
    // HotelMapper.toHotelResponseDtoFromNativeQuery) ──
    @Query(value = """
            SELECT h.id, h.name, h.city, h.latitude, h.longitude,
                   h.price_per_night, h.rating, h.amenities, h.availability_status,h.image_url,
                (6371 * acos(
                    cos(radians(:userLat)) * cos(radians(CAST(h.latitude AS DOUBLE)))
                    * cos(radians(CAST(h.longitude AS DOUBLE)) - radians(:userLon))
                    + sin(radians(:userLat)) * sin(radians(CAST(h.latitude AS DOUBLE)))
                )) AS distance
            FROM hotels h
            WHERE h.deleted = false
              AND h.verified = true
              AND h.latitude  BETWEEN :minLat AND :maxLat
              AND h.longitude BETWEEN :minLon AND :maxLon
              AND (:city IS NULL OR h.city LIKE CONCAT('%', :city, '%'))
              AND (:minPrice IS NULL OR h.price_per_night >= :minPrice)
              AND (:maxPrice IS NULL OR h.price_per_night <= :maxPrice)
              AND (:minRating IS NULL OR h.rating >= :minRating)
              AND (:availableOnly = false OR h.availability_status = true)
            HAVING distance <= :radius
            ORDER BY
                CASE WHEN :sortBy = 'distance' THEN distance END ASC,
                CASE WHEN :sortBy = 'price'    THEN h.price_per_night END ASC,
                CASE WHEN :sortBy = 'rating'   THEN h.rating END DESC
            """, countQuery = """
            SELECT COUNT(*) FROM (
                SELECT h.id,
                    (6371 * acos(
                        cos(radians(:userLat)) * cos(radians(CAST(h.latitude AS DOUBLE)))
                        * cos(radians(CAST(h.longitude AS DOUBLE)) - radians(:userLon))
                        + sin(radians(:userLat)) * sin(radians(CAST(h.latitude AS DOUBLE)))
                    )) AS distance
                FROM hotels h
                WHERE h.deleted = false AND h.verified = true
                  AND h.latitude  BETWEEN :minLat AND :maxLat
                  AND h.longitude BETWEEN :minLon AND :maxLon
                  AND (:city IS NULL OR h.city LIKE CONCAT('%', :city, '%'))
                  AND (:minPrice IS NULL OR h.price_per_night >= :minPrice)
                  AND (:maxPrice IS NULL OR h.price_per_night <= :maxPrice)
                  AND (:minRating IS NULL OR h.rating >= :minRating)
                  AND (:availableOnly = false OR h.availability_status = true)
                HAVING distance <= :radius
            ) AS sub
            """, nativeQuery = true)
    Page<Object[]> searchNearby(
            @Param("userLat") Double userLat,
            @Param("userLon") Double userLon,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLon") BigDecimal minLon,
            @Param("maxLon") BigDecimal maxLon,
            @Param("radius") Double radius,
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("availableOnly") Boolean availableOnly,
            @Param("sortBy") String sortBy,
            Pageable pageable);



    @Query("""
        SELECT h, u.username
        FROM Hotel h
        LEFT JOIN User u ON h.submittedByUserId = u.id
        WHERE h.deleted = false
    """)
    Page<Object[]> findHotelsWithUser(Pageable pageable);
}
