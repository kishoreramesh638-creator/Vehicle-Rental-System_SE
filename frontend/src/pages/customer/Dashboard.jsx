import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Car, Calendar, ShieldCheck, Clock, ArrowRight, 
  MapPin, AlertCircle, CheckCircle, IndianRupee 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/customer');
        setDashboardData(res.data?.stats);
      } catch (err) {
        console.error('Failed to load customer dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading customer dashboard..." size="lg" />;
  }

  const counts = dashboardData?.counts || { total: 0, active: 0, upcoming: 0, completed: 0, totalSpent: 0 };
  const activeRentals = dashboardData?.activeRentals || [];
  const upcomingBookings = dashboardData?.upcomingBookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your active vehicle journeys, review upcoming bookings, and manage your rental account.
          </p>
        </div>
        <Link
          to="/vehicles"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition shrink-0"
        >
          <Car className="w-4 h-4" />
          <span>Book a New Vehicle</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rental</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{counts.active}</p>
          <span className="text-[11px] text-slate-400 font-medium">In-progress journey</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{counts.upcoming}</p>
          <span className="text-[11px] text-slate-400 font-medium">Scheduled bookings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{counts.completed}</p>
          <span className="text-[11px] text-slate-400 font-medium">Past rentals</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{counts.totalSpent.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 font-medium">Verified payments</span>
        </div>
      </div>

      {/* Active Rental Alert Card (If any) */}
      {activeRentals.length > 0 && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span>Currently Active Rental In Progress</span>
          </div>

          {activeRentals.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <img
                  src={booking.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                  alt={booking.model}
                  className="w-24 h-16 object-cover rounded-xl border border-slate-100"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-lg">{booking.brand} {booking.model}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">{booking.vehicle_number}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ref: <span className="font-semibold text-slate-800">{booking.booking_reference}</span></p>
                  <div className="flex items-center space-x-4 text-xs text-slate-600 mt-2">
                    <span>Due Return: <strong className="text-slate-800">{booking.return_date}</strong></span>
                    <span>Drop Hub: <strong className="text-slate-800">{booking.return_location}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  to={`/bookings/${booking.id}`}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  View Details & Receipt
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Reservations</h2>
          <Link to="/my-bookings" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
            <span>View All ({counts.total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No upcoming reservations scheduled. Browse our vehicles to plan your next journey!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{b.booking_reference}</span>
                    <h4 className="font-bold text-slate-900 text-base">{b.brand} {b.model}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{b.pickup_date} to {b.return_date} ({b.number_of_days} Days)</p>
                  </div>
                  <StatusBadge status={b.booking_status} type="booking" />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Total: </span>
                    <strong className="text-slate-900">₹{Number(b.total_amount).toLocaleString('en-IN')}</strong>
                  </div>
                  <Link
                    to={`/bookings/${b.id}`}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
