import React, { useState, useEffect } from 'react';
import { 
  Key, CheckCircle2, RotateCcw, Gauge, Fuel, 
  AlertCircle, ShieldCheck, Clock, FileText 
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminRentals = () => {
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pickup Modal State
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [pickupOdometer, setPickupOdometer] = useState(15000);
  const [pickupFuel, setPickupFuel] = useState('100%');
  const [pickupNotes, setPickupNotes] = useState('All documents verified, vehicle in pristine condition.');

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnOdometer, setReturnOdometer] = useState(15450);
  const [returnFuel, setReturnFuel] = useState('100%');
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [damageCharges, setDamageCharges] = useState(0);
  const [returnNotes, setReturnNotes] = useState('Vehicle returned clean, deposit refunded.');

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/admin/all');
      const all = res.data?.bookings || [];
      setConfirmedBookings(all.filter(b => b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING'));
      setActiveRentals(all.filter(b => b.booking_status === 'ACTIVE'));
    } catch (err) {
      console.error('Error fetching rentals desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPickupModal = (booking) => {
    setSelectedPickup(booking);
    setPickupOdometer(15000);
    setPickupFuel('100%');
    setPickupNotes('Inspection passed. Keys handed over.');
    setPickupModalOpen(true);
  };

  const handleConfirmPickup = async (e) => {
    e.preventDefault();
    if (!selectedPickup) return;
    setSubmitting(true);

    try {
      await api.post(`/rentals/admin/${selectedPickup.id}/pickup`, {
        pickupOdometer,
        fuelLevel: pickupFuel,
        notes: pickupNotes
      });
      setPickupModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Pickup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openReturnModal = (booking) => {
    setSelectedReturn(booking);
    setReturnOdometer(15400);
    setReturnFuel('100%');
    setAdditionalCharges(0);
    setDamageCharges(0);
    setReturnNotes('Inspected upon return. Deposit released.');
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setSubmitting(true);

    try {
      await api.post(`/rentals/admin/${selectedReturn.id}/return`, {
        returnOdometer,
        fuelLevel: returnFuel,
        additionalCharges,
        damageCharges,
        notes: returnNotes
      });
      setReturnModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Return failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Accessing fleet dispatch desk..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rental Operations Desk</h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform formal physical vehicle dispatch (Pickup) and inspection return (Complete Rental).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Ready for Pickup */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <span>Ready for Pickup / Dispatch</span>
              </h2>
              <p className="text-xs text-slate-400">Confirmed reservations awaiting vehicle release</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-xs">
              {confirmedBookings.length}
            </span>
          </div>

          {confirmedBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No bookings waiting for pickup at this time.</p>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{b.booking_reference}</span>
                      <StatusBadge status={b.booking_status} type="booking" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm mt-1">{b.brand} {b.model}</p>
                    <p className="text-[11px] text-slate-500">Customer: {b.customer_name} • Hub: {b.pickup_location}</p>
                  </div>
                  <button
                    onClick={() => openPickupModal(b)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Start Pickup
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Fleet Out on Road */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>Active Rentals Out on Road</span>
              </h2>
              <p className="text-xs text-slate-400">Vehicles in use awaiting return inspection</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs">
              {activeRentals.length}
            </span>
          </div>

          {activeRentals.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No active vehicles currently out on rental.</p>
          ) : (
            <div className="space-y-3">
              {activeRentals.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{b.booking_reference}</span>
                      <StatusBadge status={b.is_overdue ? 'OVERDUE' : 'ACTIVE'} type="booking" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm mt-1">{b.brand} {b.model}</p>
                    <p className="text-[11px] text-slate-500">Return Due: <strong className="text-slate-800">{b.return_date}</strong> • Drop: {b.return_location}</p>
                  </div>
                  <button
                    onClick={() => openReturnModal(b)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Record Return
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pickup Inspection Modal */}
      <Modal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        title="Vehicle Handover & Pickup Inspection"
      >
        <form onSubmit={handleConfirmPickup} className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900">
            Booking: <strong>{selectedPickup?.booking_reference}</strong> ({selectedPickup?.brand} {selectedPickup?.model})
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Odometer Reading at Pickup (km)</label>
            <input
              type="number"
              required
              value={pickupOdometer}
              onChange={(e) => setPickupOdometer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Fuel Level</label>
            <select
              value={pickupFuel}
              onChange={(e) => setPickupFuel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
            >
              <option value="100%">100% (Full Tank)</option>
              <option value="75%">75%</option>
              <option value="50%">50%</option>
              <option value="25%">25%</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Inspection & Handover Notes</label>
            <textarea
              rows={2}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setPickupModalOpen(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm"
            >
              {submitting ? 'Confirming...' : 'Dispatch Vehicle (Set ACTIVE)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Inspection Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Vehicle Return & Condition Settlement"
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
            Booking: <strong>{selectedReturn?.booking_reference}</strong> ({selectedReturn?.brand} {selectedReturn?.model})
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Return Odometer (km)</label>
              <input
                type="number"
                required
                value={returnOdometer}
                onChange={(e) => setReturnOdometer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Return Fuel Level</label>
              <select
                value={returnFuel}
                onChange={(e) => setReturnFuel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              >
                <option value="100%">100% (Full Tank)</option>
                <option value="75%">75%</option>
                <option value="50%">50%</option>
                <option value="25%">25%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Damage Charges (₹)</label>
              <input
                type="number"
                value={damageCharges}
                onChange={(e) => setDamageCharges(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Extra Fuel / Late Fees (₹)</label>
              <input
                type="number"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Return Notes</label>
            <textarea
              rows={2}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
            >
              {submitting ? 'Processing...' : 'Complete Return (Set AVAILABLE)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRentals;
