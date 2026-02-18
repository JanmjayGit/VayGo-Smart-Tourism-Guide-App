package SmartTourismGuide.app.exceptions;

public class DuplicateReviewException extends RuntimeException {

    public DuplicateReviewException(Long userId, Long placeId) {
        super(String.format("User with ID %d has already reviewed place with ID %d", userId, placeId));
    }

    public DuplicateReviewException(String message) {
        super(message);
    }
}
