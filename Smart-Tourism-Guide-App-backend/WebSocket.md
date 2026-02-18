# WebSocket & Real-time Notifications - Learning Guide

## Overview
This document explains what was implemented across all three advanced modules and how they work together to provide real-time notifications in the Smart Tourism Guide App.

---

## Module 1: Real-time Notification System

### What Was Implemented

**1. WebSocket Configuration**
- Set up WebSocket server with STOMP protocol
- Enabled SockJS for browser compatibility
- Configured message broker with topics and queues
- Added CORS support for React frontend

**2. Authentication**
- JWT token validation during WebSocket handshake
- Token passed as query parameter in connection URL
- Secure connection establishment

**3. Database Entities**
- Notification entity to store all notifications
- UserNotificationPreference entity for user settings
- Support for JSON data storage
- Soft delete capability

**4. Notification Types & Priorities**
- 4 types: EVENT_ALERT, WEATHER_ALERT, EMERGENCY_ALERT, RECOMMENDATION
- 4 priorities: LOW, MEDIUM, HIGH, CRITICAL

**5. Topic Structure**
- `/topic/event_alert` - Broadcast event notifications
- `/topic/weather_alert` - Broadcast weather alerts
- `/topic/emergency_alert` - Broadcast emergency alerts
- `/topic/location/{city}` - City-specific notifications
- `/user/queue/personal` - User-specific private notifications

**6. Core Features**
- Send notifications to all users (broadcast)
- Send notifications to specific user
- Send notifications to users in a city
- Send notifications to event subscribers
- Persist notifications for offline users
- User preferences (enable/disable by type)
- Quiet hours (no notifications during sleep)
- Scheduled cleanup of old notifications

**7. Event Integration**
- Notify when new event is created
- Notify when event is updated
- Notify when event is cancelled
- Daily reminders at 9 AM for tomorrow's events
- 1-hour before event reminders

### How It Works

**Connection Flow:**
1. User opens app and gets JWT token from login
2. Frontend creates WebSocket connection with token
3. Server validates token and establishes connection
4. User subscribes to relevant topics
5. Server sends notifications in real-time

**Notification Flow:**
1. Event occurs (new event, weather alert, etc.)
2. Service creates notification
3. NotificationService checks user preferences
4. If user is online → Send via WebSocket
5. If user is offline → Save to database
6. User receives notification instantly or on next login

---

## Module 2: Weather Alert System

### What Was Implemented

**1. Weather Service Integration**
- Connected to OpenWeatherMap API
- Fetches current weather by city or coordinates
- Caches responses for 30 minutes
- Handles API failures gracefully

**2. Severe Weather Detection**
- Temperature extremes (< 5°C or > 40°C)
- High wind speed (> 50 km/h)
- Low visibility (< 1000m)
- Dangerous conditions (thunderstorm, tornado, etc.)
- Heavy precipitation

**3. Scheduled Monitoring**
- Runs every 3 hours automatically
- Checks 10 major Indian cities
- Detects severe weather conditions
- Triggers notifications automatically

**4. Notification Integration**
- Sends weather alerts via WebSocket
- Uses WEATHER_ALERT type
- Priority based on severity (CRITICAL or HIGH)
- Location-based delivery to affected cities

### How It Works

**Scheduled Check:**
1. Every 3 hours, system wakes up
2. Loops through monitored cities
3. Calls OpenWeatherMap API for each city
4. Checks if weather is severe
5. If severe → Sends notification to users in that city

**Alert Example:**
- Mumbai temperature: 42°C (extreme heat)
- System detects: temp > 40°C
- Creates alert: "Extreme Heat Alert"
- Sends to: `/topic/location/Mumbai`
- All Mumbai users receive notification instantly

---

## Module 3: Emergency Services Locator

### What Was Implemented

**1. Emergency Service Database**
- 6 categories: Hospital, Police Station, Fire Station, Ambulance, Pharmacy, Blood Bank
- Geospatial data (latitude, longitude)
- Contact information (phone, email)
- 24x7 availability flag
- City and address information

**2. Proximity Search**
- Haversine formula for distance calculation
- Find services within radius (up to 50km)
- Filter by category
- Sort by distance
- Limit results (max 100)

**3. Search Capabilities**
- Find nearby services by current location
- Filter by category (e.g., only hospitals)
- Search by city
- Find 24x7 services
- Get service details

**4. Admin Features**
- Create new emergency services
- Update existing services
- Delete services (soft delete)
- Broadcast emergency alerts

**5. Emergency Notifications**
- Broadcast critical alerts to all users
- Send location-based emergency alerts
- CRITICAL priority for all emergency alerts
- Instant delivery via WebSocket

### How It Works

**Proximity Search:**
1. User shares current location (lat, lon)
2. System calculates distance to all services using Haversine formula
3. Filters services within specified radius
4. Sorts by distance (nearest first)
5. Returns list with distances

**Emergency Alert:**
1. Admin detects emergency situation
2. Creates alert with city and message
3. System broadcasts via `/topic/emergency_alert` or `/topic/location/{city}`
4. All affected users receive CRITICAL notification
5. Users can see nearest emergency services

---

## How All Three Modules Work Together

### Integration Architecture

```
User Device
    ↓
WebSocket Connection (JWT Auth)
    ↓
STOMP Broker
    ↓
Topics: /topic/event_alert, /topic/weather_alert, /topic/emergency_alert, /topic/location/{city}
    ↑
NotificationService (Central Hub)
    ↑
    ├── EventNotificationService (Module 1)
    ├── WeatherNotificationService (Module 2)
    └── EmergencyNotificationService (Module 3)
```

### Example Scenario: Tourist in Mumbai

**Morning (9:00 AM):**
- EventNotificationService sends reminder: "Festival tomorrow in Mumbai"
- Delivered via `/user/queue/personal`
- User sees: "🎉 Event Tomorrow: Ganesh Chaturthi"

**Afternoon (12:00 PM):**
- WeatherNotificationService detects extreme heat (42°C)
- Sends alert via `/topic/location/Mumbai`
- User sees: "🌡️ Extreme Heat Alert - Stay hydrated"

**Evening (6:00 PM):**
- Admin broadcasts emergency: Flash flood warning
- EmergencyNotificationService sends via `/topic/location/Mumbai`
- User sees: "🚨 Emergency Alert - Avoid low-lying areas"
- User searches nearby hospitals using proximity search

### Data Flow

**1. Real-time Delivery (User Online):**
```
Event/Weather/Emergency → Service → NotificationService → WebSocket → User
```

**2. Offline Delivery (User Offline):**
```
Event/Weather/Emergency → Service → NotificationService → Database
User logs in → Fetch from Database → Display
```

**3. User Preferences:**
```
Before sending → Check UserNotificationPreference
- Is type enabled?
- Is it quiet hours?
- Is city in preferred cities?
If yes → Send, else → Skip
```

---

## Key Technologies Used

**Backend:**
- Spring WebSocket - WebSocket server
- STOMP - Messaging protocol
- SockJS - Browser compatibility
- JWT - Authentication
- JPA/Hibernate - Database
- Spring Scheduling - Automated tasks
- WebClient - External API calls

**Frontend (for testing):**
- SockJS Client - WebSocket connection
- STOMP.js - Message handling
- JavaScript - UI logic

**External Services:**
- OpenWeatherMap API - Weather data

---

## Important Concepts

**1. WebSocket vs HTTP:**
- HTTP: Request → Response (one-time)
- WebSocket: Persistent connection (real-time)

**2. STOMP Protocol:**
- Simple Text Oriented Messaging Protocol
- Works over WebSocket
- Supports pub/sub pattern

**3. Topics vs Queues:**
- Topics: Broadcast to all subscribers
- Queues: One-to-one messaging

**4. Haversine Formula:**
- Calculates distance between two points on Earth
- Uses latitude and longitude
- Returns distance in kilometers

**5. Scheduled Tasks:**
- Run automatically at specified times
- Use cron expressions
- Example: `0 0 */3 * * *` = Every 3 hours

---

## Testing the System

**1. Get JWT Token:**
- Login to app
- Copy token from response

**2. Open WebSocket Tester:**
- Open `WebSocket-Tester.html` in browser
- Paste JWT token
- Click Connect

**3. Subscribe to Topics:**
- Choose topic type
- Click Subscribe
- Wait for notifications

**4. Trigger Notifications:**
- Create new event → Event alert
- Wait for weather check → Weather alert (if severe)
- Admin broadcasts emergency → Emergency alert

---

## What You Learned

**1. Real-time Communication:**
- How WebSocket works
- STOMP protocol
- Pub/sub pattern

**2. Notification System:**
- User preferences
- Priority levels
- Persistence for offline users

**3. Scheduled Tasks:**
- Cron expressions
- Automated monitoring
- Background jobs

**4. Geospatial Queries:**
- Haversine formula
- Proximity search
- Location-based filtering

**5. System Integration:**
- Multiple modules working together
- Central notification hub
- Event-driven architecture

---

## Next Steps for Learning

**1. Frontend Integration:**
- Build React/Angular app
- Connect to WebSocket
- Display notifications in UI

**2. Advanced Features:**
- Push notifications (mobile)
- Email notifications
- SMS alerts

**3. Scalability:**
- External message broker (RabbitMQ)
- Horizontal scaling
- Load balancing

**4. Monitoring:**
- Track notification delivery
- Monitor WebSocket connections
- Analyze user engagement

---

**Remember:** This system provides real-time updates to users without them needing to refresh or poll the server. It's efficient, scalable, and provides excellent user experience!


🏗️ Architecture Design
High-Level Architecture
┌─────────────────────────────────────────────────────────────┐
│                    Client (React)                            │
│  SockJS Client + STOMP.js                                   │
└────────────────────────┬────────────────────────────────────┘
│ WebSocket Connection
▼
┌─────────────────────────────────────────────────────────────┐
│              Spring WebSocket Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WebSocketConfig (STOMP + SockJS)                    │  │
│  │  - JWT Authentication Interceptor                    │  │
│  │  - Connection Handler                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│              Message Broker (STOMP)                          │
│  Topics:                                                     │
│  - /topic/events          (Public event alerts)             │
│  - /topic/weather         (Public weather alerts)           │
│  - /topic/emergency       (Public emergency alerts)         │
│  - /user/queue/personal   (User-specific notifications)     │
└────────────────────────┬────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│           Notification Service Layer                         │
│  - NotificationService                                       │
│  - EventNotificationService                                  │
│  - WeatherNotificationService                                │
│  - EmergencyNotificationService                              │
└────────────────────────┬────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│              Database (MySQL)                                │
│  - notifications table (persistence for offline users)       │
│  - user_notification_preferences table                       │
└─────────────────────────────────────────────────────────────┘