import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserX, UserCheck, Calendar } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { search: searchTerm }
      });
      setCustomers(res.data?.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/customers/${customerId}/status`, { status: newStatus });
      await fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Review verified customer registrations, booking volumes, and account status.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-md text-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchCustomers}
          className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold"
        >
          Search
        </button>
      </div>

      {/* Customers Table */}
      {loading ? (
        <LoadingSpinner message="Loading customer directory..." size="lg" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Registered On</th>
                  <th className="px-6 py-3.5">Reservations</th>
                  <th className="px-6 py-3.5">Total Spent</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <strong className="text-slate-900 block text-sm">{c.name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">ID #{c.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{c.email}</p>
                      <p className="text-[11px] text-slate-400">{c.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{c.total_bookings} Bookings</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₹{Number(c.total_spent).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          c.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
