package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.entity.Review;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.exceptions.DuplicateReviewException;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.exceptions.UnauthorizedReviewAccessException;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.repository.ReviewRepository;
import SmartTourismGuide.app.repository.UserRepository;
import SmartTourismGuide.app.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    @Override
    @Transactional
    public ReviewResponseDto createReview(CreateReviewDto createDto, String username) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Validate place exists
        Place place = placeRepository.findById(createDto.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", createDto.getPlaceId()));

        // Check for duplicate review
        if (reviewRepository.existsByUserIdAndPlaceIdAndDeletedFalse(user.getId(), place.getId())) {
            throw new DuplicateReviewException(user.getId(), place.getId());
        }

        // Create review
        Review review = new Review();
        review.setUser(user);
        review.setPlace(place);
        review.setRating(createDto.getRating());
        review.setComment(createDto.getComment());
        review.setDeleted(false);

        Review savedReview = reviewRepository.save(review);
        log.info("Review created: User {} reviewed Place {} with rating {}", username, place.getId(),
                createDto.getRating());

        // Update place rating
        updatePlaceRating(place.getId());

        return toReviewResponseDto(savedReview, username);
    }

    @Override
    @Transactional
    public ReviewResponseDto updateReview(Long reviewId, UpdateReviewDto updateDto, String username) {
        Review review = reviewRepository.findByIdAndDeletedFalse(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Validate ownership
        validateOwnership(review, username);

        // Update fields
        if (updateDto.getRating() != null) {
            review.setRating(updateDto.getRating());
        }
        if (updateDto.getComment() != null) {
            review.setComment(updateDto.getComment());
        }

        Review updatedReview = reviewRepository.save(review);
        log.info("Review updated: Review ID {} by user {}", reviewId, username);

        // Update place rating
        updatePlaceRating(review.getPlace().getId());

        return toReviewResponseDto(updatedReview, username);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String username) {
        Review review = reviewRepository.findByIdAndDeletedFalse(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Validate ownership
        validateOwnership(review, username);

        // Soft delete
        review.setDeleted(true);
        review.setDeletedAt(LocalDateTime.now());
        reviewRepository.save(review);
        log.info("Review deleted: Review ID {} by user {}", reviewId, username);

        // Update place rating
        updatePlaceRating(review.getPlace().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getReviewsByPlace(Long placeId, Pageable pageable, String currentUsername) {
        // Validate place exists
        placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        Page<Review> reviews = reviewRepository.findByPlaceIdAndDeletedFalseOrderByCreatedAtDesc(placeId, pageable);
        return reviews.map(review -> toReviewResponseDto(review, currentUsername));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getUserReviews(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Page<Review> reviews = reviewRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId(), pageable);
        return reviews.map(review -> toReviewResponseDto(review, username));
    }

    @Override
    @Transactional(readOnly = true)
    public PlaceRatingStatsDto getPlaceRatingStats(Long placeId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        // Get aggregated stats
        List<Object> stats = reviewRepository.getPlaceRatingStats(placeId);
        Double avgRating = 0.0;
        Long totalReviews = 0L;

        if (stats != null && stats.size() >= 2) {
            if (stats.get(0) != null) {
                avgRating = ((Number) stats.get(0)).doubleValue();
            }
            if (stats.get(1) != null) {
                totalReviews = ((Number) stats.get(1)).longValue();
            }
        }

        // Get rating distribution
        List<Object[]> distribution = reviewRepository.getRatingDistribution(placeId);
        Map<Integer, Long> ratingDistribution = new HashMap<>();

        // Initialize all ratings to 0
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }

        // Fill actual counts
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingDistribution.put(rating, count);
        }

        return PlaceRatingStatsDto.builder()
                .placeId(placeId)
                .placeName(place.getName())
                .averageRating(BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP))
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .build();
    }

    @Override
    @Transactional
    public void adminDeleteReview(Long reviewId) {
        Review review = reviewRepository.findByIdAndDeletedFalse(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Soft delete
        review.setDeleted(true);
        review.setDeletedAt(LocalDateTime.now());
        reviewRepository.save(review);
        log.info("Review deleted by admin: Review ID {}", reviewId);

        // Update place rating
        updatePlaceRating(review.getPlace().getId());
    }

    // Helper methods

    @Transactional
    protected void updatePlaceRating(Long placeId) {
        List<Object> stats = reviewRepository.getPlaceRatingStats(placeId);

        Double avgRating = 0.0;
        Long reviewCount = 0L;

        if (stats != null && stats.size() >= 2) {
            if (stats.get(0) != null) {
                avgRating = ((Number) stats.get(0)).doubleValue();
            }
            if (stats.get(1) != null) {
                reviewCount = ((Number) stats.get(1)).longValue();
            }
        }

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        place.setRating(BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP));
        place.setPopularity(reviewCount);
        placeRepository.save(place);

        log.debug("Updated place {} rating to {} ({} reviews)", placeId, avgRating, reviewCount);
    }

    /**
     * Validate that the current user owns the review.
     */
    private void validateOwnership(Review review, String username) {
        if (!review.getUser().getUsername().equals(username)) {
            throw new UnauthorizedReviewAccessException();
        }
    }

    /**
     * Convert Review entity to ReviewResponseDto.
     */
    private ReviewResponseDto toReviewResponseDto(Review review, String currentUsername) {
        boolean isOwner = currentUsername != null && review.getUser().getUsername().equals(currentUsername);

        return ReviewResponseDto.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .placeId(review.getPlace().getId())
                .placeName(review.getPlace().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isOwner(isOwner)
                .build();
    }
}
