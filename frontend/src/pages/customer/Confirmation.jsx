import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, Car, Calendar, MapPin, ArrowRight, 
  Printer, ShieldCheck, Download, ExternalLink 
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export const Confirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data?.booking);
      } catch (err) {
        console.error('Failed to load confirmed booking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <LoadingSpinner message="Generating your confirmed booking receipt..." size="lg" />;
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <Link to="/my-bookings" className="text-xs text-emerald-600 font-bold mt-2 block">Back to My Bookings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
          Booking Confirmed
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">You're Ready to Roll!</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your vehicle reservation has been successfully confirmed. A receipt has been generated.
        </p>
      </div>

      {/* Confirmation Receipt Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Receipt Header Ribbon */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
              Booking Reference
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-1">
              {booking.booking_reference}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Customer: <strong className="text-white">{booking.customer_name}</strong> ({booking.customer_phone})
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={booking.booking_status} type="booking" />
            <StatusBadge status={booking.payment_status} type="payment" />
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Vehicle summary */}
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
            <img
              src={booking.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
              alt={booking.model}
              className="w-24 h-16 object-cover rounded-xl border border-slate-100"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-base">{booking.brand} {booking.model}</h3>
              <p className="text-xs text-slate-400">Reg: {booking.vehicle_number} • {booking.category}</p>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium block">Pickup</span>
              <strong className="text-slate-900 block">{booking.pickup_date}</strong>
              <p className="text-slate-500">{booking.pickup_location}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium block">Return</span>
              <strong className="text-slate-900 block">{booking.return_date}</strong>
              <p className="text-slate-500">{booking.return_location}</p>
            </div>
          </div>

          {/* Itemized Price */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Rental Charges ({booking.number_of_days} Days × ₹{Number(booking.price_per_day).toLocaleString('en-IN')})</span>
              <span className="font-semibold text-slate-900">₹{Number(booking.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Refundable Security Deposit</span>
              <span className="font-semibold text-slate-900">₹{Number(booking.security_deposit).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-700">₹{Number(booking.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Pickup Instructions */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <p className="font-bold">Next Steps for Pickup:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-emerald-800">
              <li>Carry a valid physical driving license and government ID card.</li>
              <li>Reach the designated hub on <strong>{booking.pickup_date}</strong>.</li>
              <li>A digital condition & odometer inspection will be completed before keys handover.</li>
            </ul>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 print:hidden">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link
                to="/vehicles"
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 text-center"
              >
                Browse Fleet
              </Link>
              <Link
                to={`/bookings/${booking.id}`}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20"
              >
                <span>View in My Bookings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
