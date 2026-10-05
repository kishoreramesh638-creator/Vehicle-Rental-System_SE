import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Car, Plus, Edit2, Trash2, Search, Filter, 
  RotateCcw, Check, X, ShieldAlert, Eye, Settings 
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminVehicles = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    vehicle_number: '',
    brand: '',
    model: '',
    category: 'SUV',
    year: new Date().getFullYear(),
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seating_capacity: 5,
    price_per_day: '',
    security_deposit: 5000,
    image_url: '',
    description: '',
    location: 'Mumbai',
    status: 'AVAILABLE'
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/vehicles', { params });
      setVehicles(res.data?.vehicles || []);
    } catch (err) {
      console.error('Error fetching admin vehicles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    if (searchParams.get('action') === 'add') {
      openAddModal();
    }
  }, [statusFilter]);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setIsEditing(true);
    setCurrentId(vehicle.id);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      brand: vehicle.brand,
      model: vehicle.model,
      category: vehicle.category,
      year: vehicle.year,
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      seating_capacity: vehicle.seating_capacity,
      price_per_day: vehicle.price_per_day,
      security_deposit: vehicle.security_deposit,
      image_url: vehicle.image_url || '',
      description: vehicle.description || '',
      location: vehicle.location || 'Mumbai',
      status: vehicle.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await api.put(`/vehicles/${currentId}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      setModalOpen(false);
      await fetchVehicles();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/status`, { status: newStatus });
      await fetchVehicles();
    } catch (err) {
      alert(err.message || 'Failed to update vehicle status');
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to remove vehicle "${vehicle.brand} ${vehicle.model}" (${vehicle.vehicle_number})?`)) {
      return;
    }
    try {
      await api.delete(`/vehicles/${vehicle.id}`);
      await fetchVehicles();
    } catch (err) {
      alert(err.message || 'Could not delete vehicle');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Vehicle Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add, update, inspect, and service vehicles in your rental inventory.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by brand, model, number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVehicles()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchVehicles}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold"
          >
            Filter
          </button>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-slate-500 font-semibold">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RENTED">RENTED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      {loading ? (
        <LoadingSpinner message="Fetching fleet vehicles..." size="lg" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Number Plate</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Specs</th>
                  <th className="px-6 py-3.5">Rate / Day</th>
                  <th className="px-6 py-3.5">Hub</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img
                        src={v.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80'}
                        alt={v.model}
                        className="w-12 h-10 object-cover rounded-lg border border-slate-100 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{v.brand} {v.model}</span>
                        <span className="text-[10px] text-slate-400">Year {v.year}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{v.vehicle_number}</td>
                    <td className="px-6 py-4 font-semibold">{v.category}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {v.transmission} • {v.fuel_type} • {v.seating_capacity} seats
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{Number(v.price_per_day).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-slate-600">{v.location}</td>
                    <td className="px-6 py-4">
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusChange(v.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RENTED">RENTED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete / Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Vehicle Details' : 'Add New Vehicle to Fleet'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-600 mb-1 block">Vehicle Number (Registration)</label>
              <input
                type="text"
                required
                placeholder="e.g. MH-01-AB-1234"
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Brand</label>
              <input
                type="text"
                required
                placeholder="e.g. Tata, Mahindra, Hyundai"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Nexon Fearless"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Bike">Bike</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Model Year</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Fuel Type</label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Seating Capacity</label>
              <input
                type="number"
                required
                value={formData.seating_capacity}
                onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Price Per Day (₹)</label>
              <input
                type="number"
                required
                placeholder="e.g. 2500"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Security Deposit (₹)</label>
              <input
                type="number"
                required
                placeholder="e.g. 5000"
                value={formData.security_deposit}
                onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Hub Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RENTED">RENTED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-600 mb-1 block">Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
            />
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-600 mb-1 block">Vehicle Description</label>
            <textarea
              rows={3}
              placeholder="Overview of specs, features, condition..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Vehicle')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVehicles;
