package SmartTourismGuide.app.enums;

public enum EventCategory {
    FESTIVAL("Cultural Festival"),
    CULTURAL("Cultural Event"),
    EXHIBITION("Exhibition"),
    CONCERT("Concert/Music"),
    SPORTS("Sports Event"),
    OTHER("Other");

    private final String description;

    EventCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
