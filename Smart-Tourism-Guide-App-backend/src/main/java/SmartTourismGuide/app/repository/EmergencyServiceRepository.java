package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.EmergencyServiceEntity;
import SmartTourismGuide.app.enums.EmergencyServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface EmergencyServiceRepository extends JpaRepository<EmergencyServiceEntity, Long> {

    Optional<EmergencyServiceEntity> findByIdAndDeletedFalse(Long id);

    List<EmergencyServiceEntity> findByCategoryAndDeletedFalse(EmergencyServiceCategory category);

    List<EmergencyServiceEntity> findByCityAndDeletedFalse(String city);

    List<EmergencyServiceEntity> findByAvailable24x7TrueAndDeletedFalse();

    List<EmergencyServiceEntity> findByCategoryAndCityAndDeletedFalse(EmergencyServiceCategory category, String city);

    // Find nearby emergency services using Haversine formula
    // Returns services within specified radius, sorted by distance
    @Query(value = """
            SELECT
                id,
                name,
                category,
                phone,
                email,
                latitude,
                longitude,
                address,
                city,
                state,
                available_24x7,
                description,
                deleted,
                (6371 * acos(
                    cos(radians(:latitude)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(:longitude)) +
                    sin(radians(:latitude)) *
                    sin(radians(latitude))
                )) AS distance
            FROM emergency_services
            WHERE deleted = false
                AND (:category IS NULL OR category = :category)
            HAVING distance <= :radiusKm
            ORDER BY distance ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findNearbyServices(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm,
            @Param("category") String category,
            @Param("limit") Integer limit);

    Long countByCategoryAndDeletedFalse(EmergencyServiceCategory category);

    Long countByCityAndDeletedFalse(String city);
}
