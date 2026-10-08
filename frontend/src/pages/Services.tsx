import React, { useEffect, useState } from 'react';
import { serviceApi } from '../services/api';
import { ServiceEntity, HealthStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Server, Plus, ExternalLink, RefreshCw, GitBranch, Shield, Clock } from 'lucide-react';

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repositoryUrl: '',
    environment: 'production',
    owner: '',
    currentVersion: 'v1.0.0',
    healthStatus: 'HEALTHY' as HealthStatus,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await serviceApi.getAll();
      setServices(res);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await serviceApi.create(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        repositoryUrl: '',
        environment: 'production',
        owner: '',
        currentVersion: 'v1.0.0',
        healthStatus: 'HEALTHY',
      });
      fetchServices();
    } catch (err) {
      alert('Failed to register service. Name might be duplicated.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Service Catalog & Registry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Registered production microservices, version telemetry, and health states
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchServices}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus size={16} />
            <span>Register Service</span>
          </button>
        </div>
      </div>

      {/* Grid of Microservices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {svc.environment}
                </span>
                <StatusBadge status={svc.healthStatus} />
              </div>

              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">{svc.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">Current: {svc.currentVersion}</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
                {svc.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Owner:</span>
                <span className="text-slate-200 font-medium">{svc.owner || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Repository:</span>
                <a
                  href={`https://${svc.repositoryUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span className="truncate max-w-[150px]">{svc.repositoryUrl || 'internal'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Registering a Service */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Microservice">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Service Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. inventory-service"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Responsibilities of this service"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Environment</label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="dev">dev</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Version</label>
              <input
                type="text"
                value={formData.currentVersion}
                onChange={(e) => setFormData({ ...formData, currentVersion: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Owner / Team</label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="e.g. backend-team"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Git Repository URL</label>
            <input
              type="text"
              value={formData.repositoryUrl}
              onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
              placeholder="github.com/company/repo"
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
            >
              Save Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
