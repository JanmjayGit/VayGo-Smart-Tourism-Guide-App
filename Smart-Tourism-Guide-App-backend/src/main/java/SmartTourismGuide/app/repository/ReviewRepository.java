package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

        boolean existsByUserIdAndPlaceIdAndDeletedFalse(Long userId, Long placeId);
        Optional<Review> findByUserIdAndPlaceIdAndDeletedFalse(Long userId, Long placeId);
        Optional<Review> findByIdAndDeletedFalse(Long id);
        Page<Review> findByPlaceIdAndDeletedFalseOrderByCreatedAtDesc(Long placeId, Pageable pageable);
        Page<Review> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
        @Query("""
                        SELECT AVG(CAST(r.rating AS double)), COUNT(r)
                        FROM Review r
                        WHERE r.place.id = :placeId AND r.deleted = false
                        """)
        List<Object> getPlaceRatingStats(@Param("placeId") Long placeId);

        @Query("""
                        SELECT r.rating, COUNT(r)
                        FROM Review r
                        WHERE r.place.id = :placeId AND r.deleted = false
                        GROUP BY r.rating
                        ORDER BY r.rating DESC
                        """)
        List<Object[]> getRatingDistribution(@Param("placeId") Long placeId);

        Long countByPlaceIdAndDeletedFalse(Long placeId);
}
