import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Calendar, Search, Filter, Check, X, Eye, 
  Car, AlertTriangle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminBookings = () => {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/bookings/admin/all', { params });
      setBookings(res.data?.bookings || []);
    } catch (err) {
      console.error('Error fetching admin bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/admin/${bookingId}/status`, {
        status: newStatus,
        reason: `Status changed to ${newStatus} by admin`
      });
      await fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review, approve, reject, or supervise all customer reservations.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, customer name, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchBookings}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold"
          >
            Filter
          </button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner message="Fetching reservations..." size="lg" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Rental Window</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Booking Status</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{b.booking_reference}</td>
                    <td className="px-6 py-4">
                      <strong className="text-slate-900 block">{b.customer_name}</strong>
                      <span className="text-[10px] text-slate-400">{b.customer_phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{b.brand} {b.model}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{b.vehicle_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span>{b.pickup_date} to {b.return_date}</span>
                      <span className="text-[10px] text-slate-400 block">({b.number_of_days} Days)</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.is_overdue ? 'OVERDUE' : b.booking_status} type="booking" />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.payment_status} type="payment" />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/bookings/${b.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                      >
                        Inspect
                      </Link>

                      {b.booking_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
