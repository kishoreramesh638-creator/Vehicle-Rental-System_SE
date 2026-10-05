import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Users, Calendar, IndianRupee, AlertTriangle, 
  CheckCircle, Clock, ShieldCheck, ArrowRight, Activity 
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setStats(res.data?.stats);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time fleet analytics..." size="lg" />;
  }

  const { vehicles, customers, bookings, overdueBookings, recentBookings, categoryDistribution } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">
            Executive Fleet Management
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin System Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live overview of fleet utilization, reservations, revenue, and active trips.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/rentals"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Rental Operations Desk</span>
          </Link>
          <Link
            to="/admin/vehicles"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Car className="w-4 h-4" />
            <span>Manage Vehicles</span>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner (Crucial Requirement) */}
      {overdueBookings && overdueBookings.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-red-900">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-base text-red-900">
                {overdueBookings.length} Active Rental{overdueBookings.length !== 1 ? 's' : ''} Currently OVERDUE!
              </h3>
              <p className="text-xs text-red-700">
                Vehicles whose expected return date has passed but haven't been completed yet.
              </p>
            </div>
          </div>
          <Link
            to="/admin/bookings?status=OVERDUE"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shrink-0 transition"
          >
            Review Overdue Rentals
          </Link>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{Number(bookings?.revenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">From completed & paid bookings</span>
        </div>

        {/* Total Vehicles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fleet</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{vehicles?.total || 0}</p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-600 font-bold">{vehicles?.available || 0} Free</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">{vehicles?.rented || 0} Rented</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{bookings?.total || 0}</p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
            <span className="text-amber-600 font-bold">{bookings?.pending || 0} Pending</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">{bookings?.active || 0} Active</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{customers?.total || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Verified customer accounts</span>
        </div>
      </div>

      {/* Fleet Utilization & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Vehicle Fleet Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Available for Rent</span>
                <span className="font-bold text-emerald-600">{vehicles?.available}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${((vehicles?.available || 0) / (vehicles?.total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Currently Rented</span>
                <span className="font-bold text-indigo-600">{vehicles?.rented}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${((vehicles?.rented || 0) / (vehicles?.total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Under Scheduled Maintenance</span>
                <span className="font-bold text-amber-600">{vehicles?.maintenance}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${((vehicles?.maintenance || 0) / (vehicles?.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Category Inventory</h3>
          <div className="space-y-2">
            {categoryDistribution?.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                <span className="font-semibold text-slate-700">{cat.category}</span>
                <span className="font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                  {cat.count} units
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Operational Shortcuts</h3>
          <div className="space-y-2 text-xs">
            <Link
              to="/admin/vehicles?action=add"
              className="block p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition font-bold text-slate-800"
            >
              + Add New Vehicle to Fleet
            </Link>
            <Link
              to="/admin/rentals"
              className="block p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition font-bold text-slate-800"
            >
              Start Pickup / Complete Return
            </Link>
            <Link
              to="/admin/customers"
              className="block p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition font-bold text-slate-800"
            >
              Review Customer Registrations
            </Link>
            <Link
              to="/admin/activity-logs"
              className="block p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition font-bold text-slate-800"
            >
              Audit Trail & Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Recent Reservations</h3>
          <Link to="/admin/bookings" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Rental Dates</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentBookings?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{b.booking_reference}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{b.customer_name}</p>
                    <p className="text-[11px] text-slate-400">{b.customer_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold">{b.brand} {b.model}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{b.vehicle_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span>{b.pickup_date} to {b.return_date}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.booking_status} type="booking" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/bookings/${b.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
