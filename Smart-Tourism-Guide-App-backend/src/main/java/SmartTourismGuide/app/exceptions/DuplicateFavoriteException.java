package SmartTourismGuide.app.exceptions;


public class DuplicateFavoriteException extends RuntimeException {

    public DuplicateFavoriteException(Long userId, Long placeId) {
        super(String.format("Place with ID %d is already in user's favorites (User ID: %d)", placeId, userId));
    }

    public DuplicateFavoriteException(String message) {
        super(message);
    }
}
