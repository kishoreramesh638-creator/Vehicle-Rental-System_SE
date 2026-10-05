import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Fuel, Gauge, Users, MapPin, Calendar, Shield, CheckCircle2, 
  AlertCircle, ArrowRight, ArrowLeft, Tag, Info, Clock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date selection state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');

  // Availability checking state
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        const data = res.data?.vehicle;
        setVehicle(data);
        if (data) {
          setPickupLocation(data.location || 'Mumbai Hub');
          setReturnLocation(data.location || 'Mumbai Hub');
        }
      } catch (err) {
        setError(err.message || 'Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setAvailabilityResult(null);

    if (!pickupDate || !returnDate) {
      setError('Please select both pickup and return dates.');
      return;
    }

    if (new Date(returnDate) <= new Date(pickupDate)) {
      setError('Return date must be strictly after pickup date.');
      return;
    }

    setCheckingAvailability(true);
    try {
      const res = await api.get(`/vehicles/${id}/availability`, {
        params: { pickupDate, returnDate }
      });
      setAvailabilityResult(res.data);
    } catch (err) {
      setError(err.message || 'Error checking availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleProceedToBook = () => {
    if (!availabilityResult?.available) return;

    const bookingDraft = {
      vehicleId: vehicle.id,
      vehicle,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation: returnLocation || pickupLocation,
      pricing: availabilityResult.pricing
    };

    // Store draft in sessionStorage
    sessionStorage.setItem('driveease_booking_draft', JSON.stringify(bookingDraft));

    if (!isAuthenticated) {
      // Redirect to login with state to return to checkout
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading vehicle specifications..." size="lg" />;
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Vehicle Not Found</h2>
        <p className="text-slate-500 mt-2 mb-6">{error || 'The requested vehicle could not be loaded.'}</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Catalog</span>
        </Link>
      </div>
    );
  }

  const isAvailable = vehicle.status === 'AVAILABLE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Back */}
      <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
        <Link to="/vehicles" className="hover:text-emerald-600 flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Vehicles
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{vehicle.brand} {vehicle.model}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Image Gallery & Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Vehicle Image */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 aspect-[16/10] shadow-sm">
            <img
              src={vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
                {vehicle.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/90 text-slate-800 shadow-sm backdrop-blur-md">
                {vehicle.vehicle_number}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={vehicle.status} type="vehicle" />
            </div>
          </div>

          {/* Title & Hub Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  Model Year {vehicle.year} • Fleet Registration #{vehicle.vehicle_number}
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 w-fit">
                <MapPin className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>Operating Hub: {vehicle.location}</span>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Fuel className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fuel Type</span>
                <span className="text-sm font-bold text-slate-800">{vehicle.fuel_type}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Gauge className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Transmission</span>
                <span className="text-sm font-bold text-slate-800">{vehicle.transmission}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Users className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seating</span>
                <span className="text-sm font-bold text-slate-800">{vehicle.seating_capacity} Seats</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Shield className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Deposit</span>
                <span className="text-sm font-bold text-slate-800">₹{Number(vehicle.security_deposit || 5000).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Vehicle Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {vehicle.description || 'Clean, sanitized vehicle maintained to high standards. Thoroughly checked prior to dispatch with documented odometer and fuel levels.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Booking & Availability Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg sticky top-24">
            {/* Price Header */}
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Daily Rental</span>
                <span className="text-3xl font-black text-slate-900">
                  ₹{Number(vehicle.price_per_day).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-slate-500"> / 24-hr day</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Security Deposit</span>
                <span className="text-sm font-bold text-slate-700">
                  ₹{Number(vehicle.security_deposit || 5000).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 block font-medium">Refundable</span>
              </div>
            </div>

            {/* Availability Form */}
            <form onSubmit={handleCheckAvailability} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    setAvailabilityResult(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    setAvailabilityResult(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pickup Hub
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai Airport Terminal 2"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Return Hub
                </label>
                <input
                  type="text"
                  placeholder="Same as pickup hub"
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={checkingAvailability}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                {checkingAvailability ? (
                  <span>Checking Availability...</span>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Check Availability</span>
                  </>
                )}
              </button>
            </form>

            {/* Availability Result Banner & Breakdown */}
            {availabilityResult && (
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                {availabilityResult.available ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-900">Vehicle is Available!</p>
                      <p className="mt-0.5 text-emerald-700">No overlapping reservations for selected dates.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900">Unavailable for Selected Dates</p>
                      <p className="mt-0.5 text-rose-700">{availabilityResult.reason}</p>
                    </div>
                  </div>
                )}

                {/* Price Breakdown Calculation */}
                {availabilityResult.pricing && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Rate per day</span>
                      <span className="font-semibold">₹{availabilityResult.pricing.pricePerDay.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Duration</span>
                      <span className="font-semibold">{availabilityResult.pricing.days} Days</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Rental Subtotal</span>
                      <span className="font-semibold">₹{availabilityResult.pricing.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Security Deposit</span>
                      <span className="font-semibold">₹{availabilityResult.pricing.securityDeposit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-emerald-700">₹{availabilityResult.pricing.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Final Book CTA */}
                {availabilityResult.available && (
                  <button
                    onClick={handleProceedToBook}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center space-x-2 shadow-emerald-600/30"
                  >
                    <span>Proceed to Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
