package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponseDto createReview(CreateReviewDto createDto, String username);
    ReviewResponseDto updateReview(Long reviewId, UpdateReviewDto updateDto, String username);
    void deleteReview(Long reviewId, String username);
    Page<ReviewResponseDto> getReviewsByPlace(Long placeId, Pageable pageable, String currentUsername);
    Page<ReviewResponseDto> getUserReviews(String username, Pageable pageable);
    PlaceRatingStatsDto getPlaceRatingStats(Long placeId);
    void adminDeleteReview(Long reviewId);
}
