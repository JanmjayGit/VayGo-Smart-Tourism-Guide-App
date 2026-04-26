import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Places from '@/pages/Places';
import PlaceDetails from '@/pages/PlaceDetails';
import Events from '@/pages/Events';
import EventDetails from '@/pages/EventDetails';
import Favorites from '@/pages/Favorites';
import EmergencyServices from '@/pages/EmergencyServices';
import MapPage from '@/pages/MapPage';
import WeatherPage from '@/pages/WeatherPage';
import Hotels from '@/pages/Hotels';
import HotelDetails from '@/pages/HotelDetails';
import NotificationsPage from '@/pages/NotificationsPage';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPlaces from '@/pages/admin/AdminPlaces';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminEmergency from '@/pages/admin/AdminEmergency';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminUsers from '@/pages/admin/AdminUsers';
import MyBookings from '@/pages/MyBookings';
import AdminHotelRequests from '@/pages/admin/AdminHotelRequests';
import AdminEventRequests from '@/pages/admin/AdminEventRequests';
import AdminPlaceRequests from '@/pages/admin/AdminPlaceRequests';
import AdminAddHotel from '@/pages/admin/AdminAddHotel';
import AdminHotelsPage from '@/pages/admin/AdminHotelsPage';
import SubmitEvent from '@/pages/SubmitEvent';
import SubmitPlace from '@/pages/SubmitPlace';
import UserRequestHotel from '@/pages/UserRequestHotel';
import LandingPage from '@/pages/LandingPage';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes - No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public Routes - MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/places" element={<Places />} />
            <Route path="/places/:id" element={<PlaceDetails />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/emergency" element={<EmergencyServices />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            {/* Dashboard inside MainLayout — gets the shared Navbar + sticky layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* User Community Submission Routes */}
            <Route path="/events/submit" element={<ProtectedRoute><SubmitEvent /></ProtectedRoute>} />
            <Route path="/places/submit" element={<ProtectedRoute><SubmitPlace /></ProtectedRoute>} />
            <Route path="/hotels/request" element={<ProtectedRoute><UserRequestHotel /></ProtectedRoute>} />
          </Route>

          {/* Protected Routes - With DashboardLayout (Sidebar) */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          {/* Admin Routes - AdminLayout with admin-only protection */}
          <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/places" element={<AdminPlaces />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/emergency" element={<AdminEmergency />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hotel-requests" element={<AdminHotelRequests />} />
            <Route path="/admin/event-requests" element={<AdminEventRequests />} />
            <Route path="/admin/place-requests" element={<AdminPlaceRequests />} />
            <Route path="/admin/add-hotel" element={<AdminAddHotel />} />
            <Route path="/admin/hotels" element={<AdminHotelsPage />} />
          </Route>

          {/* Landing page — public, no MainLayout wrapper */}
          <Route path="/" element={<LandingPage />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}

export default App;
