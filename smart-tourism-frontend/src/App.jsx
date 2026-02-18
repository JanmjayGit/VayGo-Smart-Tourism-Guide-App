import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Places from '@/pages/Places';
import PlaceDetails from '@/pages/PlaceDetails';
import Events from '@/pages/Events';
import EventDetails from '@/pages/EventDetails';
import Favorites from '@/pages/Favorites';
import EmergencyServices from '@/pages/EmergencyServices';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes - No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Routes - MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/places" element={<Places />} />
            <Route path="/places/:id" element={<PlaceDetails />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/emergency" element={<EmergencyServices />} />
          </Route>

          {/* Protected Routes - DashboardLayout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<div className="p-8"><h1 className="text-2xl font-bold">Profile</h1></div>} />
            <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>} />
            <Route path="/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications</h1></div>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Dashboard</h1></div>} />
            <Route path="/admin/places" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Places</h1></div>} />
            <Route path="/admin/events" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Events</h1></div>} />
            <Route path="/admin/users" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Users</h1></div>} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
