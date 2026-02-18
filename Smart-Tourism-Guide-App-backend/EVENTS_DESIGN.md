# Events & Festivals Module - Backend Design

## 🎯 Overview

A scalable backend system for managing tourism-related events and festivals with efficient date/location filtering, admin-controlled management, and public discovery APIs.

---

## 🏗️ Architecture Design

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  (Admin Dashboard / Mobile App / Public Web)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  REST API Layer                              │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  AdminController │         │  EventController │         │
│  │  (ADMIN only)    │         │  (PUBLIC)        │         │
│  │  - Create        │         │  - Search        │         │
│  │  - Update        │         │  - Filter        │         │
│  │  - Delete        │         │  - Discover      │         │
│  └──────────────────┘         └──────────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              EventService                             │  │
│  │  • Business logic                                     │  │
│  │  • Date validation                                    │  │
│  │  • Location filtering                                 │  │
│  │  • Soft delete handling                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              EventRepository                          │  │
│  │  • Custom queries                                     │  │
│  │  • Date range filtering                              │  │
│  │  • Location-based queries                            │  │
│  │  • Pagination support                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (MySQL)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              events table                             │  │
│  │  • Indexed on: event_date, city, deleted             │  │
│  │  • Composite index: (deleted, event_date, city)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Event Entity

```sql
CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('FESTIVAL', 'CULTURAL', 'EXHIBITION', 'CONCERT', 'SPORTS', 'OTHER') NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    city VARCHAR(100) NOT NULL,
    venue VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    organizer_name VARCHAR(255),
    organizer_contact VARCHAR(100),
    ticket_info TEXT,
    entry_fee DECIMAL(10, 2),
    is_free BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    website_url VARCHAR(500),
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_date (event_date),
    INDEX idx_city (city),
    INDEX idx_deleted (deleted),
    INDEX idx_category (category),
    INDEX idx_composite (deleted, event_date, city)
);
```

**Key Design Decisions:**
- `deleted` flag for soft delete
- Separate `event_date` and `event_time` for flexible querying
- `latitude/longitude` for coordinate-based filtering
- Composite index for common query patterns
- `is_free` boolean for quick filtering

---

## 🎨 Entity & DTO Design

### 1. Event Entity
```java
@Entity
@Table(name = "events")
public class Event {
    @Id @GeneratedValue
    private Long id;
    
    private String name;
    private String description;
    
    @Enumerated(EnumType.STRING)
    private EventCategory category;
    
    private LocalDate eventDate;
    private LocalTime eventTime;
    
    private String city;
    private String venue;
    private String address;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    private String organizerName;
    private String organizerContact;
    
    private String ticketInfo;
    private BigDecimal entryFee;
    private Boolean isFree;
    
    private String imageUrl;
    private String websiteUrl;
    
    private Boolean deleted = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### 2. EventCategory Enum
```java
public enum EventCategory {
    FESTIVAL("Cultural Festival"),
    CULTURAL("Cultural Event"),
    EXHIBITION("Exhibition"),
    CONCERT("Concert/Music"),
    SPORTS("Sports Event"),
    OTHER("Other");
}
```

### 3. DTOs

**EventDto (Full Response)**
```java
public class EventDto {
    private Long id;
    private String name;
    private String description;
    private EventCategory category;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String city;
    private String venue;
    private String address;
    private Double latitude;
    private Double longitude;
    private String organizerName;
    private String organizerContact;
    private String ticketInfo;
    private BigDecimal entryFee;
    private Boolean isFree;
    private String imageUrl;
    private String websiteUrl;
    private LocalDateTime createdAt;
}
```

**EventSummaryDto (Lightweight for Lists)**
```java
public class EventSummaryDto {
    private Long id;
    private String name;
    private EventCategory category;
    private LocalDate eventDate;
    private String city;
    private String venue;
    private Boolean isFree;
    private String imageUrl;
}
```

**CreateEventRequest**
```java
public class CreateEventRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    private EventCategory category;
    
    @NotNull
    @Future // Must be future date
    private LocalDate eventDate;
    
    private LocalTime eventTime;
    
    @NotBlank
    private String city;
    
    private String venue;
    private String address;
    
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private BigDecimal latitude;
    
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private BigDecimal longitude;
    
    private String organizerName;
    private String organizerContact;
    private String ticketInfo;
    private BigDecimal entryFee;
    private Boolean isFree;
    private String imageUrl;
    private String websiteUrl;
}
```

---

## 🔌 API Endpoints

### Admin APIs (Role: ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/events` | Create new event |
| PUT | `/api/admin/events/{id}` | Update event |
| DELETE | `/api/admin/events/{id}` | Soft delete event |
| PUT | `/api/admin/events/{id}/restore` | Restore deleted event |
| GET | `/api/admin/events` | Get all events (including deleted) |

### Public APIs (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Search events with filters |
| GET | `/api/events/{id}` | Get event details |
| GET | `/api/events/upcoming` | Get upcoming events |
| GET | `/api/events/current` | Get current/ongoing events |
| GET | `/api/events/city/{city}` | Get events by city |
| GET | `/api/events/category/{category}` | Get events by category |
| GET | `/api/events/nearby` | Get events near coordinates |

---

## 🔍 Query Patterns

### 1. Upcoming Events
```java
@Query("SELECT e FROM Event e WHERE e.deleted = false " +
       "AND e.eventDate >= :today ORDER BY e.eventDate ASC")
List<Event> findUpcomingEvents(@Param("today") LocalDate today, Pageable pageable);
```

### 2. Events by Date Range
```java
@Query("SELECT e FROM Event e WHERE e.deleted = false " +
       "AND e.eventDate BETWEEN :startDate AND :endDate " +
       "ORDER BY e.eventDate ASC")
List<Event> findEventsByDateRange(
    @Param("startDate") LocalDate startDate,
    @Param("endDate") LocalDate endDate,
    Pageable pageable
);
```

### 3. Events by City
```java
@Query("SELECT e FROM Event e WHERE e.deleted = false " +
       "AND LOWER(e.city) = LOWER(:city) " +
       "AND e.eventDate >= :today ORDER BY e.eventDate ASC")
List<Event> findEventsByCity(
    @Param("city") String city,
    @Param("today") LocalDate today,
    Pageable pageable
);
```

### 4. Nearby Events (Haversine Formula)
```java
@Query(value = "SELECT *, " +
       "(6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
       "cos(radians(longitude) - radians(:lon)) + " +
       "sin(radians(:lat)) * sin(radians(latitude)))) AS distance " +
       "FROM events WHERE deleted = false " +
       "AND event_date >= :today " +
       "HAVING distance <= :radiusKm " +
       "ORDER BY distance, event_date",
       nativeQuery = true)
List<Event> findNearbyEvents(
    @Param("lat") Double lat,
    @Param("lon") Double lon,
    @Param("radiusKm") Double radiusKm,
    @Param("today") LocalDate today
);
```

---

## 🛡️ Security Configuration

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.authorizeHttpRequests(auth -> auth
            // Public event discovery
            .requestMatchers("/api/events/**").permitAll()
            
            // Admin-only event management
            .requestMatchers("/api/admin/events/**").hasRole("ADMIN")
            
            .anyRequest().authenticated()
        );
        
        return http.build();
    }
}
```

---

## ⚡ Performance Optimizations

### 1. Database Indexes
```sql
-- Composite index for common queries
CREATE INDEX idx_active_upcoming ON events(deleted, event_date, city);

-- Category filtering
CREATE INDEX idx_category_date ON events(category, event_date) WHERE deleted = false;

-- Coordinate-based queries
CREATE INDEX idx_coordinates ON events(latitude, longitude) WHERE deleted = false;
```

### 2. DTO Projections
```java
// Use lightweight DTOs for list endpoints
public interface EventSummaryProjection {
    Long getId();
    String getName();
    LocalDate getEventDate();
    String getCity();
    String getVenue();
}
```

### 3. Pagination
```java
// Always use pagination for list endpoints
Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").ascending());
Page<EventSummaryDto> events = eventService.findUpcomingEvents(pageable);
```

---

## ✅ Validation Rules

### Event Date Validation
```java
@AssertTrue(message = "Event date must be today or in the future")
private boolean isValidEventDate() {
    return eventDate == null || !eventDate.isBefore(LocalDate.now());
}
```

### Coordinate Validation
```java
@DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
@DecimalMax(value = "90.0", message = "Latitude must be <= 90")
private BigDecimal latitude;

@DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
@DecimalMax(value = "180.0", message = "Longitude must be <= 180")
private BigDecimal longitude;
```

### Required Fields
```java
@NotBlank(message = "Event name is required")
private String name;

@NotNull(message = "Event category is required")
private EventCategory category;

@NotNull(message = "Event date is required")
private LocalDate eventDate;

@NotBlank(message = "City is required")
private String city;
```

---

## 🚨 Exception Handling

### Custom Exceptions
```java
public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(Long id) {
        super("Event not found with id: " + id);
    }
}

public class InvalidDateRangeException extends RuntimeException {
    public InvalidDateRangeException(String message) {
        super(message);
    }
}

public class DuplicateEventException extends RuntimeException {
    public DuplicateEventException(String message) {
        super(message);
    }
}
```

### Global Exception Handler
```java
@ExceptionHandler(EventNotFoundException.class)
public ResponseEntity<ErrorResponse> handleEventNotFound(EventNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(404, ex.getMessage()));
}

@ExceptionHandler(InvalidDateRangeException.class)
public ResponseEntity<ErrorResponse> handleInvalidDateRange(InvalidDateRangeException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse(400, ex.getMessage()));
}
```

---

## 📈 Scalability Features

### 1. Pagination Support
- Default page size: 20
- Max page size: 100
- Cursor-based pagination for large datasets (future)

### 2. Caching Strategy
```java
@Cacheable(value = "upcomingEvents", key = "#city + ':' + #page")
public Page<EventSummaryDto> getUpcomingEventsByCity(String city, int page);
```

### 3. Database Partitioning (Future)
- Partition by event_date (yearly/monthly)
- Archive old events to separate table

### 4. Read Replicas
- Route read queries to replicas
- Write queries to primary database

---

## 🔄 Service Layer Design

### EventService Interface
```java
public interface EventService {
    // Admin operations
    EventDto createEvent(CreateEventRequest request);
    EventDto updateEvent(Long id, UpdateEventRequest request);
    void deleteEvent(Long id);
    void restoreEvent(Long id);
    
    // Public operations
    Page<EventSummaryDto> getUpcomingEvents(Pageable pageable);
    Page<EventSummaryDto> getCurrentEvents(Pageable pageable);
    Page<EventSummaryDto> getEventsByDateRange(LocalDate start, LocalDate end, Pageable pageable);
    Page<EventSummaryDto> getEventsByCity(String city, Pageable pageable);
    Page<EventSummaryDto> getEventsByCategory(EventCategory category, Pageable pageable);
    Page<EventSummaryDto> getNearbyEvents(Double lat, Double lon, Double radiusKm, Pageable pageable);
    EventDto getEventById(Long id);
}
```

---

## 🎯 Implementation Phases

### Phase 1: Core Setup
1. Create Event entity
2. Create EventCategory enum
3. Create EventRepository
4. Create DTOs (EventDto, EventSummaryDto, CreateEventRequest, UpdateEventRequest)

### Phase 2: Service Layer
1. Implement EventService interface
2. Implement EventServiceImpl
3. Add validation logic
4. Add soft delete handling

### Phase 3: Controller Layer
1. Create AdminEventController (CRUD operations)
2. Create EventController (public APIs)
3. Add request validation
4. Add pagination support

### Phase 4: Security & Exception Handling
1. Configure security rules
2. Create custom exceptions
3. Update GlobalExceptionHandler
4. Add authorization checks

### Phase 5: Optimization
1. Add database indexes
2. Implement caching
3. Add DTO projections
4. Performance testing

---

## 📝 Sample API Requests

### Create Event (Admin)
```http
POST /api/admin/events
Authorization: Bearer {jwt_token}

{
  "name": "Diwali Festival 2026",
  "description": "Grand Diwali celebration with lights and fireworks",
  "category": "FESTIVAL",
  "eventDate": "2026-11-01",
  "eventTime": "18:00:00",
  "city": "Delhi",
  "venue": "India Gate",
  "address": "Rajpath, New Delhi",
  "latitude": 28.6129,
  "longitude": 77.2295,
  "organizerName": "Delhi Tourism",
  "organizerContact": "+91-11-23456789",
  "isFree": true,
  "imageUrl": "https://example.com/diwali.jpg"
}
```

### Search Upcoming Events (Public)
```http
GET /api/events/upcoming?page=0&size=20&city=Delhi
```

### Get Nearby Events (Public)
```http
GET /api/events/nearby?lat=28.6139&lon=77.2090&radius=10&page=0&size=20
```

---

## 🔮 Future Enhancements

1. **Event Recommendations**
   - Based on user preferences
   - ML-based suggestions

2. **Event Reminders**
   - Email/SMS notifications
   - Calendar integration

3. **Event Reviews & Ratings**
   - User feedback system
   - Rating aggregation

4. **Event Booking**
   - Ticket booking integration
   - Payment gateway

5. **Multi-language Support**
   - Internationalization (i18n)
   - Localized content

6. **Analytics Dashboard**
   - Event popularity metrics
   - Attendance tracking

---

## ✅ Summary

**Architecture Highlights:**
- ✅ Modular layered architecture
- ✅ Role-based access control (Admin vs Public)
- ✅ Efficient date/location filtering
- ✅ Soft delete with restore capability
- ✅ Pagination for scalability
- ✅ Comprehensive validation
- ✅ Optimized database queries
- ✅ RESTful API design

**Ready for Implementation!** 🚀

---

**Last Updated:** 2026-02-07  
**Status:** Design Complete
