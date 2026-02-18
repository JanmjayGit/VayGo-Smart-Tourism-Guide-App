package SmartTourismGuide.app.repository;

import SmartTourismGuide.app.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

        boolean existsByUserIdAndPlaceId(Long userId, Long placeId);
        Optional<Favorite> findByUserIdAndPlaceId(Long userId, Long placeId);
        @Query("""
                        SELECT f
                        FROM Favorite f
                        JOIN FETCH f.place p
                        WHERE f.user.id = :userId
                        ORDER BY f.createdAt DESC
                        """)
        Page<Favorite> findUserFavorites(@Param("userId") Long userId, Pageable pageable);

        @Query("""
                        SELECT f
                        FROM Favorite f
                        JOIN FETCH f.place p
                        WHERE f.user.id = :userId
                        ORDER BY f.createdAt DESC
                        """)
        List<Favorite> findRecentFavorites(@Param("userId") Long userId, Pageable pageable);

        long countByUserId(Long userId);
        long deleteByUserIdAndPlaceId(Long userId, Long placeId);

        @Query("""
                        SELECT p.category, COUNT(f)
                        FROM Favorite f
                        JOIN f.place p
                        WHERE f.user.id = :userId
                        GROUP BY p.category
                        ORDER BY COUNT(f) DESC
                        """)
        List<Object[]> getFavoriteCategoryDistribution(@Param("userId") Long userId);

        @Query("SELECT f.user.id FROM Favorite f WHERE f.place.id = :placeId")
        List<Long> findUserIdsByPlaceId(@Param("placeId") Long placeId);

        long countByPlaceId(Long placeId);
}
