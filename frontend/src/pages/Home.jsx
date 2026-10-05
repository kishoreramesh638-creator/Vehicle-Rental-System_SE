import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, MapPin, Car, ShieldCheck, Clock, 
  CreditCard, Sparkles, CheckCircle2, ArrowRight, Star
} from 'lucide-react';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const Home = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Search Form State
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [searchCity, setSearchCity] = useState('All');
  const [searchCategory, setSearchCategory] = useState('All');
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/vehicles?limit=4');
        const vehicles = res.data?.vehicles || [];
        setFeaturedVehicles(vehicles.slice(0, 4));
      } catch (err) {
        console.error('Error fetching featured vehicles:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity !== 'All') params.append('location', searchCity);
    if (searchCategory !== 'All') params.append('category', searchCategory);
    if (pickupDate) params.append('pickup_date', pickupDate);
    if (returnDate) params.append('return_date', returnDate);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Background gradient decorative element */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Mobility Made Effortless</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Rent the Perfect Ride in <span className="text-emerald-400">Minutes</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Explore India's cleanest verified fleet. From fuel-sipping hatchbacks and premium SUVs to spirited motorcycles—ready for daily commute or cross-country road trips.
            </p>
          </div>

          {/* Search Card Widget */}
          <div className="mt-10 max-w-5xl mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-800 border border-slate-100">
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" /> City / Hub
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="All">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              {/* Vehicle Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center">
                  <Car className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Category
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Bike">Bike & EV</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Pickup Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Return Date
                </label>
                <input
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm shadow-emerald-600/30"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Rides</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Trust & Stats Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">100%</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verified Fleet</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹0</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Hidden Charges</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">4.9 / 5</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Customer Rating</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">24 / 7</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Roadside Assistance</p>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Handpicked Fleet</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Available Vehicles</h2>
          </div>
          <Link
            to="/vehicles"
            className="mt-3 sm:mt-0 text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All Vehicles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading available fleet..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Rent in 4 Easy Steps</h2>
            <p className="text-sm text-slate-500 mt-2">Smooth, transparent vehicle rental without tedious paperwork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Select Vehicle</h3>
              <p className="text-xs text-slate-500">Pick from hatchbacks, sedans, SUVs, bikes, or luxury cars with transparent prices.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Choose Dates</h3>
              <p className="text-xs text-slate-500">Select pickup and dropoff dates. Live system ensures zero double-booking.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Simulate Payment</h3>
              <p className="text-xs text-slate-500">Instant confirmation via Card, UPI, or Cash with refundable deposit guarantee.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Drive & Enjoy</h3>
              <p className="text-xs text-slate-500">Quick pickup with documented odometer & fuel inspection. Return with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why DriveEase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Why DriveEase</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-6">
              Built for Modern Travelers, Commuters, and Enthusiasts
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Real-Time Availability Validation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Strict database overlap checks prevent double booking and ensure your chosen vehicle is reserved exclusively for you.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Transparent Fixed Pricing</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Clear daily rental rates with explicit security deposits. No surge pricing or unexpected invoice surprises.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Comprehensive Rental Records</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Precise pickup and return logging including odometer, fuel level, and condition report for total peace of mind.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/vehicles"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
              >
                <span>Browse Fleet Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
              alt="DriveEase Vehicles on the road"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
