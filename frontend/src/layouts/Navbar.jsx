import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Car, User, LogOut, Menu, X, Shield, CalendarCheck, 
  LayoutDashboard, History, KeyRound, Users, Clock
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-emerald-600 bg-emerald-50 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const adminNavLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Drive<span className="text-emerald-600">Ease</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1.5 px-1.5 py-0.5 bg-slate-100 rounded">
                Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAdmin ? (
              // Customer & Public Links
              <>
                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                <NavLink to="/vehicles" className={navLinkClass}>Vehicles</NavLink>
                {isAuthenticated && (
                  <>
                    <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>
                    <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                  </>
                )}
              </>
            ) : (
              // Admin Links
              <>
                <NavLink to="/admin" end className={adminNavLinkClass}>Dashboard</NavLink>
                <NavLink to="/admin/vehicles" className={adminNavLinkClass}>Vehicles</NavLink>
                <NavLink to="/admin/bookings" className={adminNavLinkClass}>Bookings</NavLink>
                <NavLink to="/admin/rentals" className={adminNavLinkClass}>Rentals Desk</NavLink>
                <NavLink to="/admin/customers" className={adminNavLinkClass}>Customers</NavLink>
                <NavLink to="/admin/activity-logs" className={adminNavLinkClass}>Audit Logs</NavLink>
              </>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <Link
                  to={isAdmin ? '/admin' : '/profile'}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name}</p>
                    <p className={`text-[10px] font-bold ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      {user?.role}
                    </p>
                  </div>
                </Link>

                {!isAdmin && (
                  <Link
                    to="/profile"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Account Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition shadow-emerald-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {!isAdmin ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Home
              </Link>
              <Link
                to="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Vehicles
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Customer Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Profile & Password
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <div className="px-3 py-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Admin Console
              </div>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Vehicle Fleet
              </Link>
              <Link
                to="/admin/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Bookings Management
              </Link>
              <Link
                to="/admin/rentals"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Rental Desk (Pickup/Return)
              </Link>
              <Link
                to="/admin/customers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Customer Accounts
              </Link>
              <Link
                to="/admin/activity-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Audit & Activity Logs
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
