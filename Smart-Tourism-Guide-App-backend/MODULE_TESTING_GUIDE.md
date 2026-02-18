# Module Testing Guide - Real-time Notifications, Weather & Emergency Services

## Prerequisites

**1. Start the Application**
```bash
./mvnw spring-boot:run
```

**2. Get JWT Token**
```bash
# Login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'

# Save the token
TOKEN="paste_your_token_here"
```

---

## Module 1: Real-time Notifications System

### REST API Endpoints

#### 1.1 Get All Notifications
```bash
curl http://localhost:8080/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.2 Get Unread Notifications
```bash
curl http://localhost:8080/api/notifications/unread \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.3 Get Unread Count
```bash
curl http://localhost:8080/api/notifications/unread/count \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.4 Mark Notification as Read
```bash
# Replace {id} with actual notification ID
curl -X PUT http://localhost:8080/api/notifications/{id}/read \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.5 Mark All as Read
```bash
curl -X PUT http://localhost:8080/api/notifications/read-all \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.6 Delete Notification
```bash
curl -X DELETE http://localhost:8080/api/notifications/{id} \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.7 Get Notification Preferences
```bash
curl http://localhost:8080/api/notifications/preferences \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "enableEventAlerts": true,
  "enableWeatherAlerts": true,
  "enableEmergencyAlerts": true,
  "enableRecommendationAlerts": true,
  "quietHoursStart": "22:00:00",
  "quietHoursEnd": "08:00:00",
  "notificationRadiusKm": 50.0,
  "preferredCities": ["Mumbai", "Delhi"]
}
```

#### 1.8 Update Notification Preferences
```bash
curl -X PUT http://localhost:8080/api/notifications/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enableEventAlerts": true,
    "enableWeatherAlerts": true,
    "enableEmergencyAlerts": true,
    "enableRecommendationAlerts": false,
    "quietHoursStart": "23:00:00",
    "quietHoursEnd": "07:00:00",
    "notificationRadiusKm": 30.0,
    "preferredCities": ["Mumbai", "Bangalore", "Pune"]
  }'
```

#### 1.9 Broadcast Notification (Admin Only)
```bash
curl -X POST http://localhost:8080/api/notifications/broadcast \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "RECOMMENDATION",
    "title": "Special Offer",
    "message": "Check out our new features!",
    "priority": "MEDIUM"
  }'
```

### WebSocket Connection

**Using Browser Console:**
```javascript
// 1. Load libraries
const script1 = document.createElement('script');
script1.src = 'https://cdn.jsdelivr.net/npm/sockjs-client@1.5.1/dist/sockjs.min.js';
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js';
document.head.appendChild(script2);

// 2. Wait 2 seconds, then connect
setTimeout(() => {
  const token = 'YOUR_JWT_TOKEN';
  const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
  const stompClient = Stomp.over(socket);
  
  stompClient.connect({}, function(frame) {
    console.log('✅ Connected:', frame);
    
    // Subscribe to personal notifications
    stompClient.subscribe('/user/queue/personal', (msg) => {
      console.log('📨 Personal:', JSON.parse(msg.body));
    });
    
    // Subscribe to event alerts
    stompClient.subscribe('/topic/event_alert', (msg) => {
      console.log('🎉 Event:', JSON.parse(msg.body));
    });
    
    // Subscribe to weather alerts
    stompClient.subscribe('/topic/weather_alert', (msg) => {
      console.log('🌡️ Weather:', JSON.parse(msg.body));
    });
    
    // Subscribe to emergency alerts
    stompClient.subscribe('/topic/emergency_alert', (msg) => {
      console.log('🚨 Emergency:', JSON.parse(msg.body));
    });
    
    // Subscribe to Mumbai location alerts
    stompClient.subscribe('/topic/location/Mumbai', (msg) => {
      console.log('📍 Mumbai:', JSON.parse(msg.body));
    });
  });
  
  window.stompClient = stompClient;
}, 2000);
```

---

## Module 2: Weather Alert System

### 2.1 Get Weather by City
```bash
curl "http://localhost:8080/api/weather/city/Mumbai"
```

**Response:**
```json
{
  "location": "Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "temperature": 28.5,
  "feelsLike": 31.2,
  "condition": "Clouds",
  "description": "scattered clouds",
  "humidity": 74,
  "windSpeed": 4.12,
  "pressure": 1013,
  "visibility": 10000,
  "travelSuitability": "GOOD",
  "timestamp": "2026-02-10T00:30:00",
  "cached": false
}
```

### 2.2 Get Weather by Coordinates
```bash
curl "http://localhost:8080/api/weather/location?lat=19.0760&lon=72.8777"
```

### 2.3 Get Weather for Place
```bash
curl "http://localhost:8080/api/weather/place/1"
```

### 2.4 Automatic Weather Alerts

**How It Works:**
- Runs automatically every 3 hours (`@Scheduled`)
- Monitors 10 major Indian cities
- Detects severe weather conditions
- Sends WebSocket notifications to affected cities

**Severe Weather Conditions:**
- Temperature < 5°C or > 40°C
- Wind speed > 50 km/h (13.89 m/s)
- Visibility < 1000m
- Thunderstorm, tornado, hurricane, snow, hail
- Heavy precipitation

**Check Logs:**
```bash
# Watch for scheduled weather checks
tail -f logs/spring.log | grep "WeatherNotificationService"
```

**Expected WebSocket Notification:**
```json
{
  "type": "WEATHER_ALERT",
  "title": "Extreme Heat Alert",
  "message": "scattered clouds. Temperature: 42.5°C. Wind speed: 3.2 m/s. Please take necessary precautions.",
  "priority": "CRITICAL",
  "locationCity": "Mumbai",
  "sentAt": "2026-02-10T12:00:00"
}
```

---

## Module 3: Emergency Services Locator

### 3.1 Find Nearby Emergency Services (Proximity Search)
```bash
curl "http://localhost:8080/api/emergency/nearby?lat=19.0760&lon=72.8777&radius=5&category=HOSPITAL&limit=10"
```

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `radius` (required): Search radius in km (0 to 50)
- `category` (optional): Filter by category
- `limit` (optional): Max results (default: 20, max: 100)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lilavati Hospital",
    "category": "HOSPITAL",
    "phone": "+91-22-26567891",
    "email": "info@lilavatihospital.com",
    "latitude": 19.0596,
    "longitude": 72.8295,
    "address": "A-791, Bandra Reclamation, Bandra West",
    "city": "Mumbai",
    "state": "Maharashtra",
    "available24x7": true,
    "description": "Multi-specialty hospital with 24x7 emergency services",
    "distance": 2.34
  }
]
```

### 3.2 Filter by Category
```bash
# Get all hospitals
curl "http://localhost:8080/api/emergency/category/HOSPITAL"

# Get police stations in Mumbai
curl "http://localhost:8080/api/emergency/category/POLICE_STATION?city=Mumbai"
```

**Categories:**
- `HOSPITAL`
- `POLICE_STATION`
- `FIRE_STATION`
- `AMBULANCE`
- `PHARMACY`
- `BLOOD_BANK`

### 3.3 Get Services by City
```bash
curl "http://localhost:8080/api/emergency/city/Mumbai"
```

### 3.4 Get 24x7 Services
```bash
curl "http://localhost:8080/api/emergency/24x7"
```

### 3.5 Get Service Details
```bash
curl "http://localhost:8080/api/emergency/1"
```

### 3.6 Get Statistics
```bash
curl "http://localhost:8080/api/emergency/stats"
```

**Response:**
```json
{
  "totalHospitals": 45,
  "totalPoliceStations": 28,
  "totalFireStations": 12,
  "totalPharmacies": 67
}
```

### 3.7 Create Emergency Service (Admin Only)
```bash
curl -X POST http://localhost:8080/api/emergency \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Hospital",
    "category": "HOSPITAL",
    "phone": "+91-22-12345678",
    "email": "contact@cityhospital.com",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "123 Main Street, Andheri",
    "city": "Mumbai",
    "state": "Maharashtra",
    "available24x7": true,
    "description": "General hospital with emergency services"
  }'
```

### 3.8 Update Emergency Service (Admin Only)
```bash
curl -X PUT http://localhost:8080/api/emergency/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Hospital Name",
    "category": "HOSPITAL",
    "phone": "+91-22-87654321",
    "email": "new@hospital.com",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "New Address",
    "city": "Mumbai",
    "state": "Maharashtra",
    "available24x7": true,
    "description": "Updated description"
  }'
```

### 3.9 Delete Emergency Service (Admin Only)
```bash
curl -X DELETE http://localhost:8080/api/emergency/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3.10 Broadcast Emergency Alert (Admin Only)
```bash
# Broadcast to all users
curl -X POST http://localhost:8080/api/emergency/alert \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": null,
    "title": "National Emergency Alert",
    "message": "Please stay indoors and follow official instructions.",
    "priority": "CRITICAL"
  }'

# Send to specific city
curl -X POST http://localhost:8080/api/emergency/alert \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "title": "Flash Flood Warning",
    "message": "Avoid low-lying areas. Heavy rainfall expected.",
    "priority": "CRITICAL"
  }'
```

**WebSocket Notification Received:**
```json
{
  "type": "EMERGENCY_ALERT",
  "title": "Flash Flood Warning",
  "message": "Avoid low-lying areas. Heavy rainfall expected.",
  "priority": "CRITICAL",
  "locationCity": "Mumbai",
  "sentAt": "2026-02-10T18:00:00"
}
```

---

## Complete Integration Test

### Scenario: Tourist in Mumbai

**Step 1: Check Weather**
```bash
curl "http://localhost:8080/api/weather/city/Mumbai"
```

**Step 2: Find Nearby Hospitals**
```bash
curl "http://localhost:8080/api/emergency/nearby?lat=19.0760&lon=72.8777&radius=5&category=HOSPITAL&limit=5"
```

**Step 3: Connect to WebSocket**
```javascript
// See WebSocket section above for connection code
```

**Step 4: Subscribe to Mumbai Alerts**
```javascript
stompClient.subscribe('/topic/location/Mumbai', (msg) => {
  console.log('Mumbai Alert:', JSON.parse(msg.body));
});
```

**Step 5: Trigger Notifications**

As Admin, create an event:
```bash
curl -X POST http://localhost:8080/api/admin/events \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumbai Food Festival",
    "description": "Annual food festival",
    "eventDate": "2026-02-15",
    "eventTime": "10:00:00",
    "city": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "venue": "Gateway of India",
    "category": "FESTIVAL"
  }'
```

**Expected Notifications:**
1. Event notification via `/topic/location/Mumbai`
2. Weather alerts (if severe weather detected)
3. Emergency alerts (if admin broadcasts)

---

## Notification Types & Priorities

### Types
- `EVENT_ALERT` - Event-related notifications
- `WEATHER_ALERT` - Weather warnings
- `EMERGENCY_ALERT` - Emergency broadcasts
- `RECOMMENDATION` - General recommendations

### Priorities
- `LOW` - Informational
- `MEDIUM` - Standard notifications
- `HIGH` - Important alerts
- `CRITICAL` - Urgent, requires immediate attention

---

## Testing Checklist

### Module 1: Notifications ✓
- [ ] Get all notifications
- [ ] Get unread notifications
- [ ] Mark as read
- [ ] Update preferences
- [ ] WebSocket connection
- [ ] Receive personal notifications
- [ ] Receive broadcast notifications

### Module 2: Weather ✓
- [ ] Get weather by city
- [ ] Get weather by coordinates
- [ ] Get weather for place
- [ ] Scheduled check runs (check logs)
- [ ] Severe weather detected
- [ ] Weather alert via WebSocket

### Module 3: Emergency Services ✓
- [ ] Proximity search works
- [ ] Filter by category
- [ ] Search by city
- [ ] Get 24x7 services
- [ ] Get service details
- [ ] Get statistics
- [ ] Create service (admin)
- [ ] Update service (admin)
- [ ] Delete service (admin)
- [ ] Broadcast emergency alert (admin)
- [ ] Emergency alert via WebSocket

---

## Quick Reference

**Base URL:** `http://localhost:8080`

**Auth Header:** `Authorization: Bearer {token}`

**WebSocket URL:** `ws://localhost:8080/ws?token={token}`

**Topics:**
- `/user/queue/personal` - Personal notifications
- `/topic/event_alert` - Event broadcasts
- `/topic/weather_alert` - Weather broadcasts
- `/topic/emergency_alert` - Emergency broadcasts
- `/topic/location/{city}` - City-specific alerts
