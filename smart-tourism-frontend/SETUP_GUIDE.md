# Smart Tourism Guide - Authentication Setup

## 📦 Installation Steps

### 1. Install Required Dependencies

```bash
npm install react-router-dom axios
```

### 2. Install shadcn/ui Components

```bash
npx shadcn@latest add button input label card
```

## 🚀 Quick Start

### 1. Start the Backend Server
Make sure your Spring Boot backend is running on `http://localhost:8080`

### 2. Start the Frontend
```bash
npm run dev
```

### 3. Test the Authentication Flow

1. **Register a new user:**
   - Navigate to `http://localhost:5173/register`
   - Fill in username, email, and password
   - Click "Sign Up"

2. **Login:**
   - Navigate to `http://localhost:5173/login`
   - Enter your credentials
   - Click "Sign In"

3. **Access Dashboard:**
   - You'll be automatically redirected to `/dashboard`
   - See your user information and available features

4. **Logout:**
   - Click the "Logout" button in the navigation

## 📁 File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   └── card.jsx
│   └── auth/
│       ├── LoginForm.jsx      # Login form component
│       ├── RegisterForm.jsx   # Registration form
│       └── ProtectedRoute.jsx # Route guard
├── context/
│   └── AuthContext.jsx        # Global auth state
├── pages/
│   ├── Login.jsx              # Login page
│   ├── Register.jsx           # Register page
│   └── Dashboard.jsx          # Protected dashboard
├── util/
│   └── api.js                 # Axios config & API endpoints
├── App.jsx                    # Main app with routing
└── main.jsx                   # Entry point
```

## ✅ Features Implemented

- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Management
- ✅ Protected Routes
- ✅ Role-Based UI (Admin/User)
- ✅ Automatic Token Refresh
- ✅ Form Validation
- ✅ Error Handling
- ✅ Loading States
- ✅ Responsive Design

## 🔐 How It Works

### Authentication Flow

1. **Login/Register:**
   - User submits credentials
   - Backend validates and returns JWT token
   - Token stored in localStorage
   - User data stored in context

2. **API Requests:**
   - Axios interceptor automatically adds token to headers
   - Format: `Authorization: Bearer {token}`

3. **Protected Routes:**
   - `ProtectedRoute` component checks authentication
   - Redirects to login if not authenticated
   - Redirects to dashboard if admin-only route and user is not admin

4. **Token Expiration:**
   - Response interceptor catches 401 errors
   - Automatically clears token and redirects to login

### Role-Based Access

```javascript
const { isAdmin } = useAuth();

{isAdmin() && (
  <AdminOnlyComponent />
)}
```

## 🎨 Customization

### Change Colors
Edit Tailwind classes in components:
- Login page: `from-blue-50 via-indigo-50 to-purple-50`
- Register page: `from-purple-50 via-pink-50 to-rose-50`

### Add More Routes
In `App.jsx`:
```javascript
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
```

### Add Admin-Only Routes
```javascript
<Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

## 🐛 Troubleshooting

### "Cannot find module '@/...'"
Make sure `jsconfig.json` is configured:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### CORS Errors
Backend already has `@CrossOrigin(origins = "*")` - should work fine

### Token Not Persisting
Check browser localStorage:
- Open DevTools → Application → Local Storage
- Should see `token` and `user` keys

### 401 Unauthorized
- Check if backend is running
- Verify credentials are correct
- Check if token is being sent in headers

## 📚 Next Steps

1. **Add More Pages:**
   - Places listing
   - Place details
   - Events
   - Favorites
   - Profile settings

2. **Enhance Authentication:**
   - Remember me checkbox
   - Forgot password
   - Email verification
   - Social login

3. **Improve UX:**
   - Toast notifications
   - Better loading animations
   - Form field icons
   - Password strength indicator

## 🔗 API Endpoints Used

- `POST /api/auth/signin` - Login
- `POST /api/auth/signup` - Register
- `GET /api/users/me` - Get user profile

See `API.md` for complete API documentation.

---

**You're all set!** 🎉 The authentication system is ready to use.
