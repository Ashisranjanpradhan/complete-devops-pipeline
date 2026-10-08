import React, { useEffect, useState } from 'react';
import { incidentApi, serviceApi } from '../services/api';
import { Incident, ServiceEntity, IncidentSeverity, IncidentStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus, RefreshCw, Sparkles, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const [form, setForm] = useState({
    serviceId: 1,
    title: '',
    description: '',
    severity: 'HIGH' as IncidentSeverity,
    createdBy: 'operator',
    assignedTo: 'devops',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, svcRes] = await Promise.all([
        incidentApi.getAll(),
        serviceApi.getAll(),
      ]);
      setIncidents(incRes);
      setServices(svcRes);
      if (svcRes.length > 0 && !form.serviceId) {
        setForm((prev) => ({ ...prev, serviceId: svcRes[0].id }));
      }
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await incidentApi.create(form);
      setIsModalOpen(false);
      setForm({
        serviceId: services[0]?.id || 1,
        title: '',
        description: '',
        severity: 'HIGH',
        createdBy: 'operator',
        assignedTo: 'devops',
      });
      fetchData();
    } catch (err) {
      alert('Failed to create incident');
    }
  };

  const filteredIncidents = incidents.filter((i) => {
    if (filterSeverity === 'ALL') return true;
    return i.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Incident Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track active production outages, triage service health, and run AI root-cause analysis
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition"
          >
            <Plus size={16} />
            <span>Open Incident</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-xs">
        <Filter size={14} className="text-slate-500 ml-2" />
        <span className="text-slate-400 font-medium">Severity:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filterSeverity === sev
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-semibold">#{incident.id}</span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
                <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {incident.serviceName}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(incident.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">{incident.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{incident.description}</p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                to={`/incidents/${incident.id}`}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition"
              >
                <Sparkles size={14} />
                <span>AI Incident Assistant</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
            <h4 className="text-base font-medium text-white">No Incidents Found</h4>
            <p className="text-xs text-slate-400 mt-1">No active incidents matching the selected filter criteria.</p>
          </div>
        )}
      </div>

      {/* Create Incident Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Declare New Incident">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Affected Service</label>
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: Number(e.target.value) })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.environment}) - Current: {s.currentVersion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Incident Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Payment API latency surge and 5xx errors"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentSeverity })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Assigned Lead</label>
              <input
                type="text"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Incident Symptoms / Context</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what alert triggered, observed error rate, response times, or impact..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
            >
              Open Incident
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
