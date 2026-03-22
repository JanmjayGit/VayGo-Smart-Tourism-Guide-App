# Smart Tourism Guide App - API Endpoints

## Base URL
```
http://localhost:8080
```

## Authentication Symbols
| Symbol | Meaning |
|--------|---------|
| 🌐 | Public - No authentication required |
| 🔒 | Authenticated - JWT token required |
| 👑 | Admin Only - ROLE_ADMIN required |

---

## AUTHENTICATION

🌐 POST   /api/auth/signup          - User registration
🌐 POST   /api/auth/signin          - User login

---

## USER PROFILE

🔒 GET    /api/users/me             - Get current user profile
🔒 PUT    /api/users/me             - Update current user profile
🔒 PUT    /api/users/me/password    - Change password
🔒 DELETE /api/users/me             - Delete account (soft delete)

---

## PLACES (TOURIST ATTRACTIONS)

🌐 GET    /api/places               - Get all places (with pagination)
🌐 GET    /api/places/search        - Advanced search with filters
🌐 GET    /api/places/nearby        - Location-based search
🌐 GET    /api/places/category/{category} - Filter by category
🌐 GET    /api/places/{id}          - Get place details
👑 POST   /api/admin/places         - Create place (ADMIN)
👑 PUT    /api/admin/places/{id}    - Update place (ADMIN)
👑 DELETE /api/admin/places/{id}    - Soft delete place (ADMIN)

---

## HOTELS & ACCOMMODATIONS

🌐 GET    /api/hotels/search                    - Advanced search (city, price, rating, location)
🌐 GET    /api/hotels/nearby                    - Location-based search (lat, lon, radius)
🌐 GET    /api/hotels/{id}                      - Get hotel details with imageUrls + amenities
🌐 GET    /api/hotels/city/{city}               - Get hotels by city
🌐 GET    /api/hotels/price                     - Filter by price range
🌐 GET    /api/bookings/hotels/{hotelId}/rooms   - Get room types & availability for a hotel
👑 POST   /api/admin/hotels                     - Create hotel (ADMIN)
👑 PUT    /api/admin/hotels/{id}                - Update hotel (ADMIN)
👑 DELETE /api/admin/hotels/{id}               - Soft delete hotel (ADMIN)
👑 POST   /api/admin/hotels/{hotelId}/rooms     - Add room type to hotel (ADMIN)
👑 GET    /api/admin/hotels/unverified          - List user-submitted hotels awaiting review (ADMIN)
👑 PATCH  /api/admin/hotels/{id}/verify         - Approve hotel submission (ADMIN)
👑 DELETE /api/admin/hotels/{id}/reject         - Reject & delete hotel submission (ADMIN)

---

## BOOKINGS

🔒 POST   /api/bookings                         - Create booking (auto-confirms + marks PAID)
🔒 GET    /api/bookings/my                      - Get current user's bookings
🔒 DELETE /api/bookings/{id}/cancel             - Cancel booking (refunds if future check-in)

### Booking Request Body
```json
{
  "hotelId": 1,
  "roomId": 3,
  "checkIn": "2025-04-10",
  "checkOut": "2025-04-14",
  "guests": 2
}
```

### Booking Status Values
- `PENDING` → `CONFIRMED` → `COMPLETED`
- `CANCELLED` (with `REFUNDED` payment status)

### Room Types
- `STANDARD`, `DELUXE`, `SUITE`, `FAMILY`

### Payment Status
- `UNPAID` → `PAID` → `REFUNDED`

## RESTAURANTS & FOOD

🌐 GET    /api/restaurants/search   - Advanced search with filters
🌐 GET    /api/restaurants/nearby   - Location-based search
🌐 GET    /api/restaurants/{id}     - Get restaurant details
👑 POST   /api/admin/restaurants    - Create restaurant (ADMIN)
👑 PUT    /api/admin/restaurants/{id} - Update restaurant (ADMIN)
👑 DELETE /api/admin/restaurants/{id} - Soft delete (ADMIN)

---

## REVIEWS & RATINGS

🔒 POST   /api/reviews              - Create review
🔒 PUT    /api/reviews/{id}         - Update own review
🔒 DELETE /api/reviews/{id}         - Delete own review
🌐 GET    /api/reviews/place/{placeId} - Get reviews for place
🌐 GET    /api/reviews/hotel/{hotelId} - Get reviews for hotel
🌐 GET    /api/reviews/restaurant/{restaurantId} - Get reviews for restaurant
🔒 GET    /api/reviews/my           - Get user's reviews

---

## FAVORITES & WISHLIST

🔒 POST   /api/favorites            - Add to favorites
🔒 DELETE /api/favorites/{id}       - Remove from favorites
🔒 GET    /api/favorites            - Get user's favorites
🔒 GET    /api/favorites/places     - Get favorite places
🔒 GET    /api/favorites/hotels     - Get favorite hotels
🔒 GET    /api/favorites/restaurants - Get favorite restaurants

---

## MAP INTEGRATION

🌐 GET    /api/map/places           - Get places for map (bounding box)
🌐 GET    /api/map/hotels           - Get hotels for map (bounding box)
🌐 GET    /api/map/restaurants      - Get restaurants for map (bounding box)

---

## EVENTS & FESTIVALS

🌐 GET    /api/events               - Get all events
🌐 GET    /api/events/upcoming      - Get upcoming events
🌐 GET    /api/events/search        - Search events
🌐 GET    /api/events/{id}          - Get event details
🌐 GET    /api/events/city/{city}   - Get events by city
👑 POST   /api/admin/events         - Create event (ADMIN)
👑 PUT    /api/admin/events/{id}    - Update event (ADMIN)
👑 DELETE /api/admin/events/{id}    - Delete event (ADMIN)

---

## WEATHER

🌐 GET    /api/weather/city/{city}  - Get weather by city
🌐 GET    /api/weather/location     - Get weather by coordinates (lat, lon)
🌐 GET    /api/weather/place/{id}   - Get weather for place

---

## EMERGENCY SERVICES

🌐 GET    /api/emergency/nearby     - Find nearby services (proximity search)
🌐 GET    /api/emergency/category/{category} - Filter by category
🌐 GET    /api/emergency/city/{city} - Get services by city
🌐 GET    /api/emergency/24x7       - Get 24x7 services
🌐 GET    /api/emergency/{id}       - Get service details
🌐 GET    /api/emergency/stats      - Get statistics
👑 POST   /api/emergency            - Create service (ADMIN)
👑 PUT    /api/emergency/{id}       - Update service (ADMIN)
👑 DELETE /api/emergency/{id}       - Delete service (ADMIN)
👑 POST   /api/emergency/alert      - Broadcast emergency alert (ADMIN)

---

## NOTIFICATIONS (REST)

🔒 GET    /api/notifications        - Get user's notifications
🔒 GET    /api/notifications/unread - Get unread notifications
🔒 PUT    /api/notifications/{id}/read - Mark as read
🔒 PUT    /api/notifications/read-all - Mark all as read
🔒 DELETE /api/notifications/{id}   - Delete notification
🔒 GET    /api/notifications/preferences - Get notification preferences
🔒 PUT    /api/notifications/preferences - Update preferences

---

## WEBSOCKET ENDPOINTS

### Connection
```
ws://localhost:8080/ws?token={JWT_TOKEN}
```

### Subscribe Topics

**Personal Notifications:**
```
/user/queue/personal
```

**Broadcast Topics:**
```
/topic/event_alert          - Event notifications
/topic/weather_alert        - Weather alerts
/topic/emergency_alert      - Emergency broadcasts
```

**Location-Based:**
```
/topic/location/{city}      - City-specific notifications
```

---

## Emergency Service Categories
- HOSPITAL
- POLICE_STATION
- FIRE_STATION
- AMBULANCE
- PHARMACY
- BLOOD_BANK

## Notification Types
- EVENT_ALERT
- WEATHER_ALERT
- EMERGENCY_ALERT
- RECOMMENDATION

## Notification Priorities
- LOW
- MEDIUM
- HIGH
- CRITICAL

---

## Common Query Parameters

**Pagination:**
- `page` - Page number (default: 0)
- `size` - Page size (default: 10)
- `sort` - Sort field and direction (e.g., `name,asc`)

**Location Search:**
- `lat` - Latitude
- `lon` - Longitude
- `radius` - Radius in km

**Filters:**
- `category` - Filter by category
- `city` - Filter by city
- `minRating` - Minimum rating
- `maxPrice` - Maximum price

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Testing Tools

**WebSocket Testing:**
- Open `WebSocket-Tester.html` in browser
- Paste JWT token
- Connect and subscribe to topics

**REST API Testing:**
- Use Postman, cURL, or any HTTP client
- Include `Authorization: Bearer {token}` header for protected endpoints

---

**For detailed request/response examples and learning materials, see:**
- `WebSocket.md` - Complete guide to real-time notifications
- `walkthrough.md` - Implementation walkthrough
