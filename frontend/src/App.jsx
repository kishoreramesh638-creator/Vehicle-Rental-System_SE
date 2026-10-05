import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import MyBookings from './pages/customer/MyBookings';
import BookingDetails from './pages/customer/BookingDetails';
import Checkout from './pages/customer/Checkout';
import Payment from './pages/customer/Payment';
import Confirmation from './pages/customer/Confirmation';
import Profile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVehicles from './pages/admin/Vehicles';
import AdminBookings from './pages/admin/Bookings';
import AdminRentals from './pages/admin/Rentals';
import AdminCustomers from './pages/admin/Customers';
import AdminActivityLogs from './pages/admin/ActivityLogs';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/:id" element={<VehicleDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Customer Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <BookingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:bookingId"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="confirmation/:bookingId"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <Confirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/vehicles"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminVehicles />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/rentals"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminRentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/activity-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminActivityLogs />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
