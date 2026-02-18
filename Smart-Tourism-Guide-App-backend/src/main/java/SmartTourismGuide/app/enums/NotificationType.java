package SmartTourismGuide.app.enums;

public enum NotificationType {
    EVENT_ALERT("Event Alert"),
    WEATHER_ALERT("Weather Alert"),
    EMERGENCY_ALERT("Emergency Alert"),
    RECOMMENDATION("Recommendation");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
