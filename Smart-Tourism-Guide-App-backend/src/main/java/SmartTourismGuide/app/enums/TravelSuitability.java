package SmartTourismGuide.app.enums;

public enum TravelSuitability {

    EXCELLENT("Perfect weather for sightseeing and outdoor activities"),
    GOOD("Good weather for most activities"),
    FAIR("Acceptable weather, some activities may be affected"),
    POOR("Unfavorable weather, indoor activities recommended"),
    AVOID("Severe weather, avoid outdoor activities"),

    UNKNOWN("Weather information unavailable");

    private final String description;

    TravelSuitability(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

/*
XCELLENT - Clear/Sunny, ideal temps (15-30°C)
GOOD - Partly cloudy, comfortable temps
FAIR - Cloudy, light rain
POOR - Heavy rain, extreme temps
AVOID - Storms, severe weather
UNKNOWN - Data unavailable
 */
