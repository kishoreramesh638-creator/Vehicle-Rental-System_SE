import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, AlertTriangle, ArrowRight, Eye, 
  CreditCard, XCircle, CheckCircle, Clock 
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data?.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('Change of travel schedule');
    setCancelError('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    setCancelError('');

    try {
      await api.patch(`/bookings/${selectedBooking.id}/cancel`, {
        reason: cancelReason
      });
      setCancelModalOpen(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING';
    if (activeTab === 'Active') return b.booking_status === 'ACTIVE';
    if (activeTab === 'Completed') return b.booking_status === 'COMPLETED';
    if (activeTab === 'Cancelled') return b.booking_status === 'CANCELLED' || b.booking_status === 'REJECTED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Review your reservations, track payment status, and manage active rentals.</p>
        </div>
        <Link
          to="/vehicles"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
        >
          <span>Reserve Another Ride</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        {['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Fetching your bookings..." size="lg" />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings in this category"
          description="You don't have any reservations under the selected tab."
          actionLabel="Browse Vehicles"
          actionLink="/vehicles"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isEligibleForCancel = b.booking_status === 'PENDING' || b.booking_status === 'CONFIRMED';
            const isPaymentPending = b.payment_status === 'PENDING';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Vehicle Thumbnail & Basic Info */}
                <div className="flex items-start sm:items-center space-x-4">
                  <img
                    src={b.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                    alt={b.model}
                    className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-xl border border-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {b.booking_reference}
                      </span>
                      <StatusBadge status={b.booking_status} type="booking" />
                      <StatusBadge status={b.payment_status} type="payment" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      {b.brand} {b.model}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.pickup_date} → {b.return_date} ({b.number_of_days} Days)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pickup: {b.pickup_location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-xs text-slate-400 font-medium block">Total Payable</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/bookings/${b.id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    {isPaymentPending && (
                      <Link
                        to={`/payment/${b.id}`}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Now</span>
                      </Link>
                    )}

                    {isEligibleForCancel && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Booking Confirmation"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Are you sure you want to cancel this booking?</p>
              <p className="mt-1">
                Booking Reference: <strong>{selectedBooking?.booking_reference}</strong> ({selectedBooking?.brand} {selectedBooking?.model}).
                If payment has already been completed, a simulated refund will be generated.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Reason for Cancellation
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a brief reason..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {cancelError && (
            <p className="text-xs text-rose-600 font-semibold">{cancelError}</p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
