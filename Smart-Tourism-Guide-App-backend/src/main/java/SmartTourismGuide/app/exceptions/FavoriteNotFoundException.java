package SmartTourismGuide.app.exceptions;

public class FavoriteNotFoundException extends RuntimeException {

    public FavoriteNotFoundException(Long placeId) {
        super(String.format("Favorite not found for place with ID: %d", placeId));
    }

    public FavoriteNotFoundException(String message) {
        super(message);
    }
}
