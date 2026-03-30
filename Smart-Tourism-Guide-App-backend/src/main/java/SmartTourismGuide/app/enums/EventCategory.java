package SmartTourismGuide.app.enums;

public enum EventCategory {
    FESTIVAL("Cultural Festival"),
    CULTURAL("Cultural Event"),
    EXHIBITION("Exhibition"),
    CONCERT("Concert/Music"),
    SPORTS("Sports Event"),
    OTHER("Other"),
    RELIGIOUS("Religious"),

    WORKSHOP("Workshops"),
    FOOD("Food Events"),

    ART("Art & Craft"),

    WELLNESS("Wellness & Yoga"),
    SPIRITUAL("Spiritual Gathering"),

    BUSINESS("Business & Networking"),
    TECH("Tech Events"),

    TREKKING("Trekking & Hiking"),
    OTHERS("others");
    private final String description;

    EventCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
