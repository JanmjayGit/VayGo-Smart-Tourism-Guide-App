# Admin Account Setup & Usage Guide

## 🔐 Default Admin Credentials

When you start the application, an admin account is **automatically created** with these credentials:

```
Username: admin
Email: admin@smarttourism.com
Password: Admin@123
```

> ⚠️ **IMPORTANT**: Change this password after first login in production!

---

## 🚀 Quick Start Guide

### Step 1: Start the Application

```bash
cd /Users/janmjay/Desktop/Smart-Tourism-Guide-App
./mvnw spring-boot:run
```

You should see this message in the console:
```
═══════════════════════════════════════════════════════════
✅ Admin user created successfully!
   Username: admin
   Email: admin@smarttourism.com
   Password: Admin@123
   ⚠️  IMPORTANT: Change the password after first login!
═══════════════════════════════════════════════════════════
```

### Step 2: Login as Admin

```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@smarttourism.com",
  "role": "ROLE_ADMIN"
}
```

**Copy the token** from the response!

### Step 3: Add Your First Place

Replace `YOUR_JWT_TOKEN` with the token from Step 2:

```bash
curl -X POST http://localhost:8080/api/admin/places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Taj Mahal",
    "description": "An ivory-white marble mausoleum on the right bank of the river Yamuna. One of the Seven Wonders of the World.",
    "category": "ATTRACTION",
    "latitude": 27.1751,
    "longitude": 78.0421,
    "address": "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001",
    "rating": 4.8,
    "imageUrl": "https://example.com/taj-mahal.jpg",
    "contactInfo": "+91-562-2227261",
    "priceRange": 2
  }'
```

### Step 4: Test Nearby Search (No Auth Required)

```bash
curl "http://localhost:8080/api/places/nearby?lat=27.1751&lon=78.0421&radius=10&page=0&size=20&sort=distance"
```

Now you should see the Taj Mahal in the results! 🎉

---

## 📋 Admin API Endpoints

All admin endpoints require the JWT token in the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Place
```bash
POST /api/admin/places
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Place Name",
  "description": "Description",
  "category": "ATTRACTION|HOTEL|RESTAURANT|EVENT",
  "latitude": 27.1751,
  "longitude": 78.0421,
  "address": "Full address",
  "rating": 4.5,
  "imageUrl": "https://...",
  "contactInfo": "Phone/Email",
  "openingHours": "{\"monday\":\"9:00-18:00\"}",
  "priceRange": 1-4
}
```

### Update Place
```bash
PUT /api/admin/places/{placeId}
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Updated Name",
  "rating": 4.8
}
```
*Note: All fields are optional in update*

### Delete Place
```bash
DELETE /api/admin/places/{placeId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Place Details
```bash
GET /api/admin/places/{placeId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### List All Places
```bash
GET /api/admin/places?page=0&size=20
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 Testing with Postman

### 1. Login Request
- **Method**: POST
- **URL**: `http://localhost:8080/api/auth/signin`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```
- **Save the token** from response

### 2. Create Place Request
- **Method**: POST
- **URL**: `http://localhost:8080/api/admin/places`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: Use sample JSON from `sample-places.md`

### 3. Test Nearby Search
- **Method**: GET
- **URL**: `http://localhost:8080/api/places/nearby?lat=27.1751&lon=78.0421&radius=10`
- **Headers**: None (public endpoint)

---

## 🔄 How It Works

1. **On Application Startup**:
   - `AdminUserInitializer` runs automatically
   - Checks if admin user exists
   - If not, creates admin with default credentials
   - Logs credentials to console

2. **Security**:
   - Admin endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
   - JWT token required in Authorization header
   - Token expires after 24 hours (configurable)

3. **Database**:
   - Admin user stored in `users` table
   - Role set to `ROLE_ADMIN`
   - Password encrypted with BCrypt

---

## 🔒 Changing Admin Password

### Option 1: Via Profile Update API
```bash
curl -X PUT http://localhost:8080/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "admin@smarttourism.com"
  }'
```

### Option 2: Via Database (for development)
```sql
-- Connect to MySQL
mysql -u root -p

USE smart_tourism;

-- Update password (this is 'NewPassword@123' encrypted)
UPDATE users 
SET password = '$2a$10$...' 
WHERE username = 'admin';
```

### Option 3: Delete and Recreate
```sql
-- Delete admin user
DELETE FROM users WHERE username = 'admin';

-- Restart application - admin will be recreated with default password
```

---

## 📝 Sample Data

See `sample-places.md` for ready-to-use JSON payloads:
- Taj Mahal (Attraction)
- India Gate (Attraction)
- The Oberoi Amarvilas (Hotel)
- Bukhara Restaurant (Restaurant)
- Holi Festival (Event)

---

## ⚠️ Troubleshooting

### "Admin user already exists"
- This is normal - admin is only created once
- Use existing credentials to login

### "Access Denied" or "403 Forbidden"
- Make sure you're using the correct JWT token
- Check that token hasn't expired (24 hours)
- Verify you're logged in as admin (check role in token response)

### "Invalid credentials"
- Double-check username: `admin`
- Double-check password: `Admin@123`
- If changed, use your new password

### No places in nearby search
- Make sure you've added places via admin API first
- Check that coordinates are within search radius
- Verify places were created successfully

---

## 🎯 Next Steps

1. ✅ Start application
2. ✅ Login as admin
3. ✅ Add sample places
4. ✅ Test nearby search
5. ✅ Test navigation
6. 🔄 Change admin password (recommended)
7. 🚀 Build your frontend!

Happy coding! 🎉
