import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-auto border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Drive<span className="text-emerald-500">Ease</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier vehicle rental platform. Clean cars, rugged SUVs, and nimble bikes available with transparent pricing, zero hidden charges, and instant verification.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>100% Verified Fleet & Insured</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Explore Fleet</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vehicles?category=SUV" className="hover:text-emerald-400 transition">SUVs & Off-Roaders</Link></li>
              <li><Link to="/vehicles?category=Sedan" className="hover:text-emerald-400 transition">Executive Sedans</Link></li>
              <li><Link to="/vehicles?category=Hatchback" className="hover:text-emerald-400 transition">City Hatchbacks</Link></li>
              <li><Link to="/vehicles?category=Bike" className="hover:text-emerald-400 transition">Motorcycles & EVs</Link></li>
              <li><Link to="/vehicles?category=Luxury" className="hover:text-emerald-400 transition">Luxury Fleet</Link></li>
            </ul>
          </div>

          {/* Hub Locations */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Operating Cities</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span>Mumbai & Airport T2</span></li>
              <li className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span>Bengaluru (Koramangala/Indiranagar)</span></li>
              <li className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span>Delhi NCR & IGI Airport</span></li>
              <li className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span>Pune (Viman Nagar/Kothrud)</span></li>
            </ul>
          </div>

          {/* Demo Credentials Helper Box */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
            <h4 className="text-white font-semibold mb-2 flex items-center justify-between">
              <span>Demo Login Access</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">Quick Test</span>
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div>
                <p className="text-slate-500 font-semibold">Admin Account:</p>
                <code className="text-emerald-300 block">admin@vehiclerental.com</code>
                <span className="text-slate-400">Pass: Admin@123</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-500 font-semibold">Customer Account:</p>
                <code className="text-emerald-300 block">rahul.sharma@example.com</code>
                <span className="text-slate-400">Pass: Customer@123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DriveEase Rental Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Built for Enterprise & Reliability</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
