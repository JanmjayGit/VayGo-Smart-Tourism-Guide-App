package SmartTourismGuide.app.exceptions;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(Long id) {
        super("Event not found with id: " + id);
    }

    public EventNotFoundException(String message) {
        super(message);
    }
}
