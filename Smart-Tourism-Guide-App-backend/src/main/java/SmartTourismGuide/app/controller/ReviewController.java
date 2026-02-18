package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.*;
import SmartTourismGuide.app.dto.response.*;
import SmartTourismGuide.app.dto.update.*;
import SmartTourismGuide.app.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;


    @PostMapping
    public ResponseEntity<ReviewResponseDto> createReview(
            @Valid @RequestBody CreateReviewDto createDto,
            Authentication authentication) {
        String username = authentication.getName();
        ReviewResponseDto review = reviewService.createReview(createDto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewDto updateDto,
            Authentication authentication) {
        String username = authentication.getName();
        ReviewResponseDto review = reviewService.updateReview(reviewId, updateDto, username);
        return ResponseEntity.ok(review);
    }


    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        String username = authentication.getName();
        reviewService.deleteReview(reviewId, username);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/place/{placeId}")
    public ResponseEntity<Page<ReviewResponseDto>> getReviewsByPlace(
            @PathVariable Long placeId,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) Integer size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size);
        String currentUsername = authentication != null ? authentication.getName() : null;
        Page<ReviewResponseDto> reviews = reviewService.getReviewsByPlace(placeId, pageable, currentUsername);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/place/{placeId}/stats")
    public ResponseEntity<PlaceRatingStatsDto> getPlaceRatingStats(@PathVariable Long placeId) {
        PlaceRatingStatsDto stats = reviewService.getPlaceRatingStats(placeId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<Page<ReviewResponseDto>> getMyReviews(
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) Integer size,
            Authentication authentication) {

        String username = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponseDto> reviews = reviewService.getUserReviews(username, pageable);
        return ResponseEntity.ok(reviews);
    }
}
