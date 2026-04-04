const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

const apiEndpoints = {
    // Authentication
    LOGIN: `${BASE_URL}/api/auth/signin`,
    REGISTER: `${BASE_URL}/api/auth/signup`,
    FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,
    CHANGE_PASSWORD: `${BASE_URL}/api/auth/change-password`,

    // Places
    GET_PLACES: `${BASE_URL}/api/places`,
    GET_PLACE_BY_ID: (id) => `${BASE_URL}/api/places/${id}`,
    NEARBY_PLACES: `${BASE_URL}/api/places/nearby`,
    PLACE_NAVIGATION: (id) => `${BASE_URL}/api/places/${id}/navigation`,

    // Events
    SEARCH_EVENTS: `${BASE_URL}/api/events`,
    GET_EVENT_BY_ID: (id) => `${BASE_URL}/api/events/${id}`,
    UPCOMING_EVENTS: `${BASE_URL}/api/events/upcoming`,
    CURRENT_EVENTS: `${BASE_URL}/api/events/current`,
    EVENTS_BY_CITY: (city) => `${BASE_URL}/api/events/city/${city}`,
    EVENTS_BY_CATEGORY: (category) => `${BASE_URL}/api/events/category/${category}`,
    NEARBY_EVENTS: `${BASE_URL}/api/events/nearby`,
    EVENTS_BY_DATE_RANGE: `${BASE_URL}/api/events/date-range`,

    // Hotels
    SEARCH_HOTELS: `${BASE_URL}/api/hotels/search`,
    NEARBY_HOTELS: `${BASE_URL}/api/hotels/nearby`,
    GET_HOTEL_BY_ID: (id) => `${BASE_URL}/api/hotels/${id}`,
    HOTELS_BY_CITY: (city) => `${BASE_URL}/api/hotels/city/${city}`,
    HOTELS_BY_PRICE: `${BASE_URL}/api/hotels/price`,
    GET_HOTEL_ROOMS: (hotelId) => `${BASE_URL}/api/bookings/hotels/${hotelId}/rooms`,

    // Bookings
    CREATE_BOOKING: `${BASE_URL}/api/bookings`,
    GET_MY_BOOKINGS: `${BASE_URL}/api/bookings/my`,
    CANCEL_BOOKING: (id) => `${BASE_URL}/api/bookings/${id}/cancel`,

    // Restaurants
    SEARCH_RESTAURANTS: `${BASE_URL}/api/restaurants/search`,
    NEARBY_RESTAURANTS: `${BASE_URL}/api/restaurants/nearby`,
    GET_RESTAURANT_BY_ID: (id) => `${BASE_URL}/api/restaurants/${id}`,
    RESTAURANTS_BY_CUISINE: (cuisineType) => `${BASE_URL}/api/restaurants/cuisine/${cuisineType}`,
    RESTAURANTS_BY_CATEGORY: (category) => `${BASE_URL}/api/restaurants/category/${category}`,
    RESTAURANTS_BY_CITY: (city) => `${BASE_URL}/api/restaurants/city/${city}`,

    // Favorites
    ADD_FAVORITE: (placeId) => `${BASE_URL}/api/favorites/${placeId}`,
    REMOVE_FAVORITE: (placeId) => `${BASE_URL}/api/favorites/${placeId}`,
    GET_FAVORITES: `${BASE_URL}/api/favorites`,
    CHECK_FAVORITE: (placeId) => `${BASE_URL}/api/favorites/check/${placeId}`,
    RECENT_FAVORITES: `${BASE_URL}/api/favorites/recent`,
    FAVORITES_COUNT: `${BASE_URL}/api/favorites/count`,

    // Reviews
    CREATE_REVIEW: `${BASE_URL}/api/reviews`,
    UPDATE_REVIEW: (id) => `${BASE_URL}/api/reviews/${id}`,
    DELETE_REVIEW: (id) => `${BASE_URL}/api/reviews/${id}`,
    PLACE_REVIEWS: (placeId) => `${BASE_URL}/api/reviews/place/${placeId}`,
    GET_REVIEWS_BY_PLACE: (placeId) => `${BASE_URL}/api/reviews/place/${placeId}`, // alias used by ReviewsSection
    PLACE_RATING_STATS: (placeId) => `${BASE_URL}/api/reviews/place/${placeId}/stats`,
    GET_RATING_STATS: (placeId) => `${BASE_URL}/api/reviews/place/${placeId}/stats`, // alias used by ReviewsSection
    MY_REVIEWS: `${BASE_URL}/api/reviews/my-reviews`,

    // Weather
    WEATHER_BY_LOCATION: `${BASE_URL}/api/weather/location`,
    WEATHER_BY_CITY: (city) => `${BASE_URL}/api/weather/city/${city}`,
    WEATHER_BY_PLACE: (placeId) => `${BASE_URL}/api/weather/place/${placeId}`,

    // Emergency Services
    NEARBY_EMERGENCY: `${BASE_URL}/api/emergency/nearby`,
    EMERGENCY_BY_CATEGORY: (category) => `${BASE_URL}/api/emergency/category/${category}`,
    EMERGENCY_BY_CITY: (city) => `${BASE_URL}/api/emergency/city/${city}`,
    EMERGENCY_24X7: `${BASE_URL}/api/emergency/24x7`,
    GET_EMERGENCY_BY_ID: (id) => `${BASE_URL}/api/emergency/${id}`,
    EMERGENCY_STATS: `${BASE_URL}/api/emergency/stats`,

    // Notifications
    GET_NOTIFICATIONS: `${BASE_URL}/api/notifications`,
    UNREAD_NOTIFICATIONS: `${BASE_URL}/api/notifications/unread`,
    UNREAD_COUNT: `${BASE_URL}/api/notifications/unread/count`,
    MARK_AS_READ: (id) => `${BASE_URL}/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${BASE_URL}/api/notifications/read-all`,
    DELETE_NOTIFICATION: (id) => `${BASE_URL}/api/notifications/${id}`,
    NOTIFICATION_PREFERENCES: `${BASE_URL}/api/notifications/preferences`,

    // User Profile
    GET_PROFILE: `${BASE_URL}/api/profile`,
    UPDATE_PROFILE: `${BASE_URL}/api/profile`,
    USER_PREFERENCES: `${BASE_URL}/api/profile/preferences`,
    GET_USER_CONTRIBUTIONS: `${BASE_URL}/api/user/contributions`,

    // Hotel Reviews
    HOTEL_REVIEWS: (hotelId) => `${BASE_URL}/api/reviews/hotel/${hotelId}`,

    // Similar Events
    SIMILAR_EVENTS: `${BASE_URL}/api/events/similar`,

    // Map
    MAP_MARKERS_BBOX: `${BASE_URL}/api/map/markers/bbox`,
    MAP_MARKERS_NEARBY: `${BASE_URL}/api/map/markers/nearby`,
    MAP_MARKERS_BY_CATEGORY: (category) => `${BASE_URL}/api/map/markers/category/${category}`,
    GET_MARKER_BY_ID: (id) => `${BASE_URL}/api/map/markers/${id}`,

    // Admin - Places
    ADMIN_GET_ALL_PLACES: `${BASE_URL}/api/admin/places`,
    ADMIN_CREATE_PLACE: `${BASE_URL}/api/admin/places`,
    ADMIN_UPDATE_PLACE: (id) => `${BASE_URL}/api/admin/places/${id}`,
    ADMIN_DELETE_PLACE: (id) => `${BASE_URL}/api/admin/places/${id}`,
    ADMIN_RESTORE_PLACE: (id) => `${BASE_URL}/api/admin/places/${id}/restore`,
    ADMIN_PENDING_PLACES: `${BASE_URL}/api/admin/places/pending`,
    ADMIN_VERIFY_PLACE: (id) => `${BASE_URL}/api/admin/places/${id}/verify`,
    ADMIN_REJECT_PLACE: (id) => `${BASE_URL}/api/admin/places/${id}/reject`,

    // User Submission
    SUBMIT_PLACE: `${BASE_URL}/api/places/submit`,
    SUBMIT_EVENT: `${BASE_URL}/api/events/submit`,
    REQUEST_HOTEL: `${BASE_URL}/api/hotels/request`,

    // Admin - Events
    ADMIN_CREATE_EVENT: `${BASE_URL}/api/admin/events`,
    ADMIN_UPDATE_EVENT: (id) => `${BASE_URL}/api/admin/events/${id}`,
    ADMIN_DELETE_EVENT: (id) => `${BASE_URL}/api/admin/events/${id}`,
    ADMIN_RESTORE_EVENT: (id) => `${BASE_URL}/api/admin/events/${id}/restore`,
    ADMIN_PENDING_EVENTS: `${BASE_URL}/api/admin/events/pending`,
    ADMIN_VERIFY_EVENT: (id) => `${BASE_URL}/api/admin/events/${id}/verify`,
    ADMIN_REJECT_EVENT: (id) => `${BASE_URL}/api/admin/events/${id}/reject`,

    // Admin - Hotels
    ADMIN_CREATE_HOTEL: `${BASE_URL}/api/admin/hotels`,
    ADMIN_UPDATE_HOTEL: (id) => `${BASE_URL}/api/admin/hotels/${id}`,
    ADMIN_DELETE_HOTEL: (id) => `${BASE_URL}/api/admin/hotels/${id}`,
    ADMIN_UNVERIFIED_HOTELS: `${BASE_URL}/api/admin/hotels/unverified`,
    ADMIN_VERIFY_HOTEL: (id) => `${BASE_URL}/api/admin/hotels/${id}/verify`,
    ADMIN_REJECT_HOTEL: (id) => `${BASE_URL}/api/admin/hotels/${id}/reject`,
    ADMIN_ADD_ROOM: (hotelId) => `${BASE_URL}/api/admin/hotels/${hotelId}/rooms`,

    // Admin - Reviews
    ADMIN_DELETE_REVIEW: (id) => `${BASE_URL}/api/admin/reviews/${id}`,

    // Admin - Notifications
    ADMIN_DELETE_NOTIFICATION: (id) => `${BASE_URL}/api/admin/notifications/${id}`,
    NOTIFICATION_BROADCAST: `${BASE_URL}/api/notifications/broadcast`,

    // Admin - Emergency Alerts
    EMERGENCY_ALERT: `${BASE_URL}/api/emergency/alert`,
    EMERGENCY_CREATE: `${BASE_URL}/api/emergency`,
    EMERGENCY_UPDATE: (id) => `${BASE_URL}/api/emergency/${id}`,
    EMERGENCY_DELETE: (id) => `${BASE_URL}/api/emergency/${id}`,
};

export default apiEndpoints;
