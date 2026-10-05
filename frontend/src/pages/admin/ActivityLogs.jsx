import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Filter, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (entityFilter) params.entityType = entityFilter;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Audit & Activity Trail</h1>
          <p className="text-sm text-slate-500 mt-1">Immutable ledger of administrative actions, booking lifecycles, and security events.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <label className="text-slate-500 font-bold">Filter Entity:</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium"
          >
            <option value="">All Entities</option>
            <option value="BOOKING">BOOKING</option>
            <option value="VEHICLE">VEHICLE</option>
            <option value="RENTAL">RENTAL</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="USER">USER</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading audit history..." size="lg" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Initiator</th>
                  <th className="px-6 py-3.5">Event Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-[10px] text-slate-400 font-mono block">#{log.entity_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.user_name ? (
                        <div>
                          <strong className="text-slate-800">{log.user_name}</strong>
                          <span className="text-[10px] text-slate-400 block">{log.user_role}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md">
                      {log.description}
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

export default AdminActivityLogs;
