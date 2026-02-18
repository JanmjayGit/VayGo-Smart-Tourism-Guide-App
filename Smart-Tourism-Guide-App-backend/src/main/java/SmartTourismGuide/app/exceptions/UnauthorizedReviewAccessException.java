package SmartTourismGuide.app.exceptions;

public class UnauthorizedReviewAccessException extends RuntimeException {

    public UnauthorizedReviewAccessException() {
        super("You can only modify your own reviews");
    }

    public UnauthorizedReviewAccessException(String message) {
        super(message);
    }
}
