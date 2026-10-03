import React, { useEffect, useState } from 'react';
import { auditApi } from '../services/api';
import { AuditLog } from '../types';
import { History, RefreshCw, Shield, Terminal, Clock, User } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getRecentLogs();
      setLogs(res);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail & Security Log</h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of operator actions, deployments, incident transitions & AI investigations
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Actor / User</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Target Resource</th>
                <th className="py-3.5 px-6">Details</th>
                <th className="py-3.5 px-6">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-6 text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-white flex items-center space-x-1.5">
                    <User size={13} className="text-cyan-400" />
                    <span>{log.username}</span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-300 font-mono">{log.resource}</td>
                  <td className="py-3.5 px-6 text-slate-400 max-w-xs truncate">{log.details}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
