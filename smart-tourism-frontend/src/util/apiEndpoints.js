const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

/**
 * API Endpoints for Smart Tourism Guide Backend
 * All endpoints mapped from Spring Boot controllers
 */
const apiEndpoints = {
    // ============================================
    // Authentication (/api/auth)
    // ============================================
    LOGIN: `${BASE_URL}/api/auth/signin`,
    REGISTER: `${BASE_URL}/api/auth/signup`,

    // ============================================
    // Places (/api/places)
    // ============================================
    GET_PLACES: `${BASE_URL}/api/places`,
    GET_PLACE_BY_ID: (id) => `${BASE_URL}/api/places/${id}`,
    NEARBY_PLACES: `${BASE_URL}/api/places/nearby`,
    PLACE_NAVIGATION: (id) => `${BASE_URL}/api/places/${id}/navigation`,

    // ============================================
    // Events (/api/events)
    // ============================================
    SEARCH_EVENTS: `${BASE_URL}/api/events`,
    GET_EVENT_BY_ID: (id) => `${BASE_URL}/api/events/${id}`,
    UPCOMING_EVENTS: `${BASE_URL}/api/events/upcoming`,
    CURRENT_EVENTS: `${BASE_URL}/api/events/current`,
    EVENTS_BY_CITY: (city) => `${BASE_URL}/api/events/city/${city}`,
    EVENTS_BY_CATEGORY: (category) => `${BASE_URL}/api/events/category/${category}`,
    NEARBY_EVENTS: `${BASE_URL}/api/events/nearby`,
    EVENTS_BY_DATE_RANGE: `${BASE_URL}/api/events/date-range`,

    // ============================================
    // Hotels (/api/hotels)
    // ============================================
    SEARCH_HOTELS: `${BASE_URL}/api/hotels/search`,
    NEARBY_HOTELS: `${BASE_URL}/api/hotels/nearby`,
    GET_HOTEL_BY_ID: (id) => `${BASE_URL}/api/hotels/${id}`,
    HOTELS_BY_CITY: (city) => `${BASE_URL}/api/hotels/city/${city}`,
    HOTELS_BY_PRICE: `${BASE_URL}/api/hotels/price`,

    // ============================================
    // Restaurants (/api/restaurants)
    // ============================================
    SEARCH_RESTAURANTS: `${BASE_URL}/api/restaurants/search`,
    NEARBY_RESTAURANTS: `${BASE_URL}/api/restaurants/nearby`,
    GET_RESTAURANT_BY_ID: (id) => `${BASE_URL}/api/restaurants/${id}`,
    RESTAURANTS_BY_CUISINE: (cuisineType) => `${BASE_URL}/api/restaurants/cuisine/${cuisineType}`,
    RESTAURANTS_BY_CATEGORY: (category) => `${BASE_URL}/api/restaurants/category/${category}`,
    RESTAURANTS_BY_CITY: (city) => `${BASE_URL}/api/restaurants/city/${city}`,

    // ============================================
    // Favorites (/api/favorites)
    // ============================================
    ADD_FAVORITE: (placeId) => `${BASE_URL}/api/favorites/${placeId}`,
    REMOVE_FAVORITE: (placeId) => `${BASE_URL}/api/favorites/${placeId}`,
    GET_FAVORITES: `${BASE_URL}/api/favorites`,
    CHECK_FAVORITE: (placeId) => `${BASE_URL}/api/favorites/check/${placeId}`,
    RECENT_FAVORITES: `${BASE_URL}/api/favorites/recent`,
    FAVORITES_COUNT: `${BASE_URL}/api/favorites/count`,

    // ============================================
    // Reviews (/api/reviews)
    // ============================================
    CREATE_REVIEW: `${BASE_URL}/api/reviews`,
    UPDATE_REVIEW: (id) => `${BASE_URL}/api/reviews/${id}`,
    DELETE_REVIEW: (id) => `${BASE_URL}/api/reviews/${id}`,
    PLACE_REVIEWS: (placeId) => `${BASE_URL}/api/reviews/place/${placeId}`,
    PLACE_RATING_STATS: (placeId) => `${BASE_URL}/api/reviews/place/${placeId}/stats`,
    MY_REVIEWS: `${BASE_URL}/api/reviews/my-reviews`,

    // ============================================
    // Weather (/api/weather)
    // ============================================
    WEATHER_BY_LOCATION: `${BASE_URL}/api/weather/location`,
    WEATHER_BY_CITY: (city) => `${BASE_URL}/api/weather/city/${city}`,
    WEATHER_BY_PLACE: (placeId) => `${BASE_URL}/api/weather/place/${placeId}`,

    // ============================================
    // Emergency Services (/api/emergency)
    // ============================================
    NEARBY_EMERGENCY: `${BASE_URL}/api/emergency/nearby`,
    EMERGENCY_BY_CATEGORY: (category) => `${BASE_URL}/api/emergency/category/${category}`,
    EMERGENCY_BY_CITY: (city) => `${BASE_URL}/api/emergency/city/${city}`,
    EMERGENCY_24X7: `${BASE_URL}/api/emergency/24x7`,
    GET_EMERGENCY_BY_ID: (id) => `${BASE_URL}/api/emergency/${id}`,
    EMERGENCY_STATS: `${BASE_URL}/api/emergency/stats`,

    // ============================================
    // Notifications (/api/notifications)
    // ============================================
    GET_NOTIFICATIONS: `${BASE_URL}/api/notifications`,
    UNREAD_NOTIFICATIONS: `${BASE_URL}/api/notifications/unread`,
    UNREAD_COUNT: `${BASE_URL}/api/notifications/unread/count`,
    MARK_AS_READ: (id) => `${BASE_URL}/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${BASE_URL}/api/notifications/read-all`,
    DELETE_NOTIFICATION: (id) => `${BASE_URL}/api/notifications/${id}`,
    NOTIFICATION_PREFERENCES: `${BASE_URL}/api/notifications/preferences`,

    // ============================================
    // User Profile (/api/profile)
    // ============================================
    GET_PROFILE: `${BASE_URL}/api/profile`,
    UPDATE_PROFILE: `${BASE_URL}/api/profile`,
    USER_PREFERENCES: `${BASE_URL}/api/profile/preferences`,

    // ============================================
    // Map (/api/map)
    // ============================================
    MAP_MARKERS_BBOX: `${BASE_URL}/api/map/markers/bbox`,
    MAP_MARKERS_NEARBY: `${BASE_URL}/api/map/markers/nearby`,
    MAP_MARKERS_BY_CATEGORY: (category) => `${BASE_URL}/api/map/markers/category/${category}`,
    GET_MARKER_BY_ID: (id) => `${BASE_URL}/api/map/markers/${id}`,
};

export default apiEndpoints;
