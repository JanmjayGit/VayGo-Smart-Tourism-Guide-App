package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.enums.PlaceCategory;
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
public interface PlaceRepository extends JpaRepository<Place, Long> {

    @Query(value = """
            SELECT p.id, p.name, p.description, p.category, p.latitude, p.longitude,
                   p.address, p.rating, p.popularity, p.image_url, p.contact_info,
                   p.opening_hours, p.price_range,
                (6371 * acos(
                    cos(radians(:userLat)) * cos(radians(CAST(p.latitude AS DOUBLE)))
                    * cos(radians(CAST(p.longitude AS DOUBLE)) - radians(:userLon))
                    + sin(radians(:userLat)) * sin(radians(CAST(p.latitude AS DOUBLE)))
                )) AS distance
            FROM places p
            WHERE p.latitude BETWEEN :minLat AND :maxLat
              AND p.longitude BETWEEN :minLon AND :maxLon
              AND p.deleted = false
              AND (:category IS NULL OR p.category = :category)
            HAVING distance <= :radius
            ORDER BY
                CASE WHEN :sortBy = 'distance' THEN distance END ASC,
                CASE WHEN :sortBy = 'rating' THEN p.rating END DESC,
                CASE WHEN :sortBy = 'popularity' THEN p.popularity END DESC
            """, countQuery = """
            SELECT COUNT(*)
            FROM (
                SELECT p.id,
                    (6371 * acos(
                        cos(radians(:userLat)) * cos(radians(CAST(p.latitude AS DOUBLE)))
                        * cos(radians(CAST(p.longitude AS DOUBLE)) - radians(:userLon))
                        + sin(radians(:userLat)) * sin(radians(CAST(p.latitude AS DOUBLE)))
                    )) AS distance
                FROM places p
                WHERE p.latitude BETWEEN :minLat AND :maxLat
                  AND p.longitude BETWEEN :minLon AND :maxLon
                  AND p.deleted = false
                  AND (:category IS NULL OR p.category = :category)
                HAVING distance <= :radius
            ) AS nearby_places
            """, nativeQuery = true)
    Page<Object[]> findNearbyPlaces(
            @Param("userLat") Double userLat,
            @Param("userLon") Double userLon,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLon") BigDecimal minLon,
            @Param("maxLon") BigDecimal maxLon,
            @Param("radius") Double radius,
            @Param("category") String category,
            @Param("sortBy") String sortBy,
            Pageable pageable);

    List<Place> findByCategory(PlaceCategory category);

    List<Place> findByNameContainingIgnoreCase(String name);

    // Soft delete queries
    Page<Place> findByDeletedFalse(Pageable pageable);

    Optional<Place> findByIdAndDeletedFalse(Long id);

    @Query("SELECT p FROM Place p WHERE :includeDeleted = true OR p.deleted = false")
    Page<Place> findAllWithDeletedFilter(@Param("includeDeleted") boolean includeDeleted, Pageable pageable);

    List<Place> findByCategoryAndDeletedFalse(PlaceCategory category);

    // Hotel-specific queries
    Page<Place> findByCategoryAndCityContainingIgnoreCaseAndDeletedFalse(
            PlaceCategory category, String city, Pageable pageable);

    Page<Place> findByCategoryAndPricePerNightBetweenAndDeletedFalse(
            PlaceCategory category, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    Page<Place> findByCategoryAndRatingGreaterThanEqualAndDeletedFalse(
            PlaceCategory category, BigDecimal minRating, Pageable pageable);

    Page<Place> findByCategoryAndAvailabilityStatusAndDeletedFalse(
            PlaceCategory category, Boolean available, Pageable pageable);

    @Query(value = """
            SELECT p.id, p.name, p.city, p.latitude, p.longitude,
                   p.price_per_night, p.rating, p.amenities, p.availability_status,
                (6371 * acos(
                    cos(radians(:userLat)) * cos(radians(CAST(p.latitude AS DOUBLE)))
                    * cos(radians(CAST(p.longitude AS DOUBLE)) - radians(:userLon))
                    + sin(radians(:userLat)) * sin(radians(CAST(p.latitude AS DOUBLE)))
                )) AS distance
            FROM places p
            WHERE p.category = 'HOTEL'
              AND p.deleted = false
              AND p.latitude BETWEEN :minLat AND :maxLat
              AND p.longitude BETWEEN :minLon AND :maxLon
              AND (:city IS NULL OR p.city LIKE CONCAT('%', :city, '%'))
              AND (:minPrice IS NULL OR p.price_per_night >= :minPrice)
              AND (:maxPrice IS NULL OR p.price_per_night <= :maxPrice)
              AND (:minRating IS NULL OR p.rating >= :minRating)
              AND (:availableOnly = false OR p.availability_status = true)
            HAVING distance <= :radius
            ORDER BY
                CASE WHEN :sortBy = 'distance' THEN distance END ASC,
                CASE WHEN :sortBy = 'price' THEN p.price_per_night END ASC,
                CASE WHEN :sortBy = 'rating' THEN p.rating END DESC
            """, nativeQuery = true)
    Page<Object[]> searchHotelsWithFilters(
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

    // Restaurant-specific queries
    Page<Place> findByCategoryAndCuisineTypeAndDeletedFalse(
            PlaceCategory category, String cuisineType, Pageable pageable);

    Page<Place> findByCategoryAndFoodCategoryAndDeletedFalse(
            PlaceCategory category, String foodCategory, Pageable pageable);

    Page<Place> findByCategoryAndCityAndCuisineTypeAndDeletedFalse(
            PlaceCategory category, String city, String cuisineType, Pageable pageable);

    @Query(value = """
            SELECT p.id, p.name, p.city, p.cuisine_type, p.food_category,
                   p.latitude, p.longitude, p.price_per_night AS avg_price,
                   p.rating, p.popular_dishes, p.amenities,
                   (6371 * acos(
                       cos(radians(:userLat)) * cos(radians(p.latitude)) *
                       cos(radians(p.longitude) - radians(:userLon)) +
                       sin(radians(:userLat)) * sin(radians(p.latitude))
                   )) AS distance
            FROM places p
            WHERE p.category = 'RESTAURANT'
              AND p.deleted = false
              AND p.latitude BETWEEN :minLat AND :maxLat
              AND p.longitude BETWEEN :minLon AND :maxLon
              AND (:city IS NULL OR p.city LIKE CONCAT('%', :city, '%'))
              AND (:cuisineType IS NULL OR p.cuisine_type = :cuisineType)
              AND (:foodCategory IS NULL OR p.food_category = :foodCategory)
              AND (:minPrice IS NULL OR p.price_per_night >= :minPrice)
              AND (:maxPrice IS NULL OR p.price_per_night <= :maxPrice)
              AND (:minRating IS NULL OR p.rating >= :minRating)
              AND (:activeOnly = false OR p.availability_status = true)
            HAVING distance <= :radius
            ORDER BY
                CASE WHEN :sortBy = 'distance' THEN distance END ASC,
                CASE WHEN :sortBy = 'rating' THEN p.rating END DESC,
                CASE WHEN :sortBy = 'popularity' THEN p.popularity END DESC,
                CASE WHEN :sortBy = 'price' THEN p.price_per_night END ASC
            """, nativeQuery = true)
    Page<Object[]> searchRestaurantsWithFilters(
            @Param("userLat") Double userLat,
            @Param("userLon") Double userLon,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLon") BigDecimal minLon,
            @Param("maxLon") BigDecimal maxLon,
            @Param("radius") Double radius,
            @Param("city") String city,
            @Param("cuisineType") String cuisineType,
            @Param("foodCategory") String foodCategory,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("activeOnly") Boolean activeOnly,
            @Param("sortBy") String sortBy,
            Pageable pageable);

    // Map Support Queries

    @Query("""
            SELECT p FROM Place p
            WHERE p.latitude BETWEEN :minLat AND :maxLat
            AND p.longitude BETWEEN :minLon AND :maxLon
            AND p.deleted = false
            AND (:categories IS NULL OR p.category IN :categories)
            ORDER BY p.rating DESC
            """)
    List<Place> findInBoundingBox(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon,
            @Param("categories") List<String> categories);

    @Query("""
            SELECT p FROM Place p
            WHERE p.category = :category
            AND p.deleted = false
            AND (:minLat IS NULL OR p.latitude >= :minLat)
            AND (:maxLat IS NULL OR p.latitude <= :maxLat)
            AND (:minLon IS NULL OR p.longitude >= :minLon)
            AND (:maxLon IS NULL OR p.longitude <= :maxLon)
            ORDER BY p.rating DESC
            """)
    List<Place> findByCategoryInBounds(
            @Param("category") PlaceCategory category,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon);
}
