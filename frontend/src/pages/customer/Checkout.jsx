import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Car, Calendar, MapPin, ShieldCheck, ArrowRight, 
  ArrowLeft, CheckCircle2, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('driveease_booking_draft');
    if (!saved) {
      navigate('/vehicles', { replace: true });
      return;
    }
    try {
      setDraft(JSON.parse(saved));
    } catch (e) {
      navigate('/vehicles', { replace: true });
    }
  }, [navigate]);

  const handleCreateBooking = async () => {
    if (!agreeTerms) {
      setError('You must accept the rental terms & condition to proceed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        vehicleId: draft.vehicleId,
        pickupDate: draft.pickupDate,
        returnDate: draft.returnDate,
        pickupLocation: draft.pickupLocation,
        returnLocation: draft.returnLocation
      });

      const newBooking = res.data?.booking;
      sessionStorage.removeItem('driveease_booking_draft');
      navigate(`/payment/${newBooking.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!draft) {
    return <LoadingSpinner message="Preparing checkout..." />;
  }

  const { vehicle, pricing } = draft;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
        <Link to={`/vehicles/${vehicle.id}`} className="hover:text-emerald-600 flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Vehicle
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Review & Checkout</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Step 1 of 2: Reservation Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Confirm Your Reservation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review the rental period and pricing details before payment simulation.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicle summary */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
            <img
              src={vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
              alt={vehicle.model}
              className="w-36 h-24 object-cover rounded-2xl border border-slate-100 shrink-0"
            />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{vehicle.category}</span>
              <h2 className="text-xl font-black text-slate-900">{vehicle.brand} {vehicle.model}</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 block w-fit">
                {vehicle.vehicle_number}
              </span>
              <p className="text-xs text-slate-500">{vehicle.transmission} • {vehicle.fuel_type} • {vehicle.seating_capacity} Seats</p>
            </div>
          </div>

          {/* Dates & Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">Schedule</span>
              <div className="flex justify-between text-slate-700">
                <span>Pickup:</span>
                <strong className="text-slate-900">{draft.pickupDate}</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Return:</span>
                <strong className="text-slate-900">{draft.returnDate}</strong>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span>Duration:</span>
                <strong className="text-emerald-700 font-bold">{pricing.days} Days</strong>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">Locations</span>
              <div className="text-slate-700">
                <span className="text-slate-400">Pickup Hub:</span>
                <p className="font-bold text-slate-900">{draft.pickupLocation}</p>
              </div>
              <div className="text-slate-700 pt-1 border-t border-slate-200">
                <span className="text-slate-400">Return Hub:</span>
                <p className="font-bold text-slate-900">{draft.returnLocation}</p>
              </div>
            </div>
          </div>

          {/* Price Calculation (Backend truth) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm">Calculated Pricing Breakdown</h3>
            <div className="flex justify-between">
              <span>Rental Charges ({pricing.days} Days × ₹{pricing.pricePerDay.toLocaleString('en-IN')})</span>
              <span className="font-semibold text-slate-900">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Refundable Security Deposit</span>
              <span className="font-semibold text-slate-900">₹{pricing.securityDeposit.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-emerald-700">₹{pricing.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
              I agree to the vehicle rental terms, security deposit policy, and condition inspection protocol.
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleCreateBooking}
              disabled={loading}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition shadow-emerald-600/30 flex items-center space-x-2"
            >
              {loading ? (
                <span>Creating Reservation...</span>
              ) : (
                <>
                  <span>Proceed to Payment (₹{pricing.total.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
