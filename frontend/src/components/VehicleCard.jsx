import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Gauge, Users, MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const VehicleCard = ({ vehicle }) => {
  const isAvailable = vehicle.status === 'AVAILABLE';

  // Fallback vehicle thumbnail
  const imageSrc = vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Thumbnail with category and status badge */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md">
            {vehicle.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={vehicle.status} type="vehicle" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Model Year {vehicle.year}</p>
            </div>
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {vehicle.location}
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5" title="Fuel Type">
              <Fuel className="w-4 h-4 text-emerald-600" />
              <span>{vehicle.fuel_type}</span>
            </div>
            <div className="flex items-center space-x-1.5" title="Transmission">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center space-x-1.5" title="Seating Capacity">
              <Users className="w-4 h-4 text-amber-600" />
              <span>{vehicle.seating_capacity} Seats</span>
            </div>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{Number(vehicle.price_per_day).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-slate-500"> / day</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              + ₹{Number(vehicle.security_deposit || 5000).toLocaleString('en-IN')} deposit
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="w-full text-center py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              View Details
            </Link>
            {isAvailable ? (
              <Link
                to={`/vehicles/${vehicle.id}?action=book`}
                className="w-full text-center py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1 shadow-sm shadow-emerald-200"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
