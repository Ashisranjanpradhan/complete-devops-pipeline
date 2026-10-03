import React, { useEffect, useState } from 'react';
import { deploymentApi, serviceApi } from '../services/api';
import { Deployment, ServiceEntity } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { GitCommit, Play, RotateCcw, RefreshCw, Clock, CheckCircle, AlertOctagon } from 'lucide-react';

export const Deployments: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  const [deployForm, setDeployForm] = useState({
    serviceId: 1,
    version: 'v2.8.2',
    commitHash: '',
    environment: 'production',
    triggeredBy: 'Jenkins',
  });

  const [rollbackForm, setRollbackForm] = useState({
    targetVersion: '',
    reason: '',
    operator: 'devops',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [depRes, svcRes] = await Promise.all([
        deploymentApi.getAll(),
        serviceApi.getAll(),
      ]);
      setDeployments(depRes);
      setServices(svcRes);
      if (svcRes.length > 0 && !deployForm.serviceId) {
        setDeployForm((prev) => ({ ...prev, serviceId: svcRes[0].id }));
      }
    } catch (err) {
      console.error('Failed to load deployments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deploymentApi.create(deployForm);
      setIsDeployModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to trigger deployment');
    }
  };

  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeployment) return;
    try {
      await deploymentApi.rollback(selectedDeployment.id, rollbackForm);
      setIsRollbackModalOpen(false);
      setSelectedDeployment(null);
      setRollbackForm({ targetVersion: '', reason: '', operator: 'devops' });
      fetchData();
    } catch (err) {
      alert('Failed to initiate rollback');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deployments & Releases</h1>
          <p className="text-sm text-slate-400 mt-1">
            Continuous delivery tracking, deployment verification & automated rollback controls
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
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition"
          >
            <Play size={16} />
            <span>Trigger Deployment</span>
          </button>
        </div>
      </div>

      {/* Deployment Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Service</th>
                <th className="py-3.5 px-6">Version / Commit</th>
                <th className="py-3.5 px-6">Environment</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Triggered By</th>
                <th className="py-3.5 px-6">Started</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-6 font-medium text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{dep.serviceName}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-300">
                    <div>{dep.version}</div>
                    <div className="text-[10px] text-slate-500">{dep.commitHash?.slice(0, 8)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {dep.environment}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={dep.status} />
                  </td>
                  <td className="py-4 px-6 text-slate-400">{dep.triggeredBy}</td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(dep.startedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {dep.status === 'SUCCESS' && (
                      <button
                        onClick={() => {
                          setSelectedDeployment(dep);
                          setIsRollbackModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                      >
                        <RotateCcw size={12} />
                        <span>Rollback</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Deployment Modal */}
      <Modal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} title="Trigger Deployment">
        <form onSubmit={handleCreateDeployment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Service</label>
            <select
              value={deployForm.serviceId}
              onChange={(e) => setDeployForm({ ...deployForm, serviceId: Number(e.target.value) })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.environment}) - Current: {s.currentVersion}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Version Tag</label>
              <input
                type="text"
                required
                value={deployForm.version}
                onChange={(e) => setDeployForm({ ...deployForm, version: e.target.value })}
                placeholder="v2.8.2"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Commit Hash</label>
              <input
                type="text"
                value={deployForm.commitHash}
                onChange={(e) => setDeployForm({ ...deployForm, commitHash: e.target.value })}
                placeholder="auto / a72f93c"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Triggered By</label>
            <input
              type="text"
              value={deployForm.triggeredBy}
              onChange={(e) => setDeployForm({ ...deployForm, triggeredBy: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeployModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
            >
              Start Deployment
            </button>
          </div>
        </form>
      </Modal>

      {/* Rollback Modal */}
      <Modal isOpen={isRollbackModalOpen} onClose={() => setIsRollbackModalOpen(false)} title="Controlled Rollback">
        <form onSubmit={handleRollback} className="space-y-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 leading-relaxed">
            <div className="font-semibold mb-1 flex items-center space-x-1.5">
              <AlertOctagon size={16} />
              <span>Operator Authorization Gate</span>
            </div>
            You are rolling back <span className="font-mono font-bold text-white">{selectedDeployment?.serviceName}</span> from{' '}
            <span className="font-mono font-bold text-white">{selectedDeployment?.version}</span>.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Version to Restore</label>
            <input
              type="text"
              value={rollbackForm.targetVersion}
              onChange={(e) => setRollbackForm({ ...rollbackForm, targetVersion: e.target.value })}
              placeholder="Leave blank to auto-restore previous stable release"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Rollback Justification / Reason *</label>
            <textarea
              rows={3}
              required
              value={rollbackForm.reason}
              onChange={(e) => setRollbackForm({ ...rollbackForm, reason: e.target.value })}
              placeholder="e.g. Error rate surged to 14% and DB pool saturation following v2.8.1 deployment"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsRollbackModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20"
            >
              Confirm Rollback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
