import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Fuel, Gauge, ArrowLeft, CreditCard, 
  ShieldCheck, AlertCircle, FileText, CheckCircle, Clock 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

export const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of travel plan');
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data?.booking);
    } catch (err) {
      setError(err.message || 'Could not load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      await api.patch(`/bookings/${booking.id}/cancel`, { reason: cancelReason });
      setCancelModalOpen(false);
      await fetchBooking();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading reservation details..." size="lg" />;
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Booking Details Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
        <Link to="/my-bookings" className="text-xs font-bold text-emerald-600 hover:underline">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const isEligibleForCancel = (booking.booking_status === 'PENDING' || booking.booking_status === 'CONFIRMED') && user?.role === 'CUSTOMER';
  const isPaymentPending = booking.payment_status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs text-slate-400 font-mono">Reference: {booking.booking_reference}</span>
      </div>

      {/* Main Reservation Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
              Official Rental Reservation
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {booking.booking_reference}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Created on {new Date(booking.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.booking_status} type="booking" />
            <StatusBadge status={booking.payment_status} type="payment" />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Vehicle and Dates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            {/* Vehicle info */}
            <div className="flex space-x-4">
              <img
                src={booking.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                alt={booking.model}
                className="w-28 h-24 object-cover rounded-2xl border border-slate-100 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{booking.category}</span>
                <h3 className="text-lg font-bold text-slate-900">{booking.brand} {booking.model}</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 block w-fit">
                  {booking.vehicle_number}
                </span>
                <p className="text-xs text-slate-500">{booking.transmission} • {booking.fuel_type}</p>
              </div>
            </div>

            {/* Travel schedule */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Pickup Date:</span>
                <strong className="text-slate-900">{booking.pickup_date}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Return Date:</span>
                <strong className="text-slate-900">{booking.return_date}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Rental Period:</span>
                <strong className="text-emerald-700 font-bold">{booking.number_of_days} Days</strong>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] text-slate-500">
                  <span>Pickup: <strong>{booking.pickup_location}</strong></span>
                  <br />
                  <span>Return: <strong>{booking.return_location}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Itemized Invoice</h3>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Daily Vehicle Rental ({booking.number_of_days} days × ₹{Number(booking.price_per_day).toLocaleString('en-IN')})</span>
                <span className="font-semibold text-slate-800">₹{Number(booking.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-slate-800">₹{Number(booking.security_deposit).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700">₹{Number(booking.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Inspection / Rental Record (if started or finished) */}
          {booking.rental_record && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Vehicle Inspection Record</h3>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Pickup Odometer</span>
                  <strong className="text-slate-800">{booking.rental_record.pickup_odometer} km</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Pickup Fuel</span>
                  <strong className="text-slate-800">{booking.rental_record.fuel_level_pickup}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Return Odometer</span>
                  <strong className="text-slate-800">{booking.rental_record.return_odometer ? `${booking.rental_record.return_odometer} km` : 'Pending'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Return Fuel</span>
                  <strong className="text-slate-800">{booking.rental_record.fuel_level_return || 'Pending'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {isPaymentPending && (
              <Link
                to={`/payment/${booking.id}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{Number(booking.total_amount).toLocaleString('en-IN')}</span>
              </Link>
            )}

            {isEligibleForCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Booking Cancellation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel booking <strong>{booking.booking_reference}</strong>?
          </p>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
            placeholder="Cancellation reason..."
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Keep
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetails;
