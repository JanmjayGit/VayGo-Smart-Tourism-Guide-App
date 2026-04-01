package SmartTourismGuide.app.enums;

public enum EventCategory {
    FESTIVAL("Festival"),
    CULTURAL("Cultural"),
    EXHIBITION("Exhibition"),
    CONCERT("Concert/Music"),
    SPORTS("Sports"),
    RELIGIOUS("Religious"),

    WORKSHOP("Workshops"),
    FOOD("Food Events"),

    ART("Art & Craft"),

    WELLNESS("Wellness & Yoga"),
    SPIRITUAL("Spiritual Gathering"),

    BUSINESS("Business & Networking"),
    TECH("Tech Events"),

    TREKKING("Trekking & Hiking"),
    OTHER("Other");

    private final String description;

    EventCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
