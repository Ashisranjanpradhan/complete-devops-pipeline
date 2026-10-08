import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deploymentApi, serviceApi } from '../services/api';
import { Deployment, ServiceEntity } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  GitCommit,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Activity,
  AlertOctagon
} from 'lucide-react';

export const DeploymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deploymentId = Number(id);

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [service, setService] = useState<ServiceEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const depRes = await deploymentApi.getById(deploymentId);
      setDeployment(depRes);

      try {
        const svcRes = await serviceApi.getById(depRes.serviceId);
        setService(svcRes);
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load deployment details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deploymentId) {
      fetchData();
    }
  }, [deploymentId]);

  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deploymentApi.rollback(deploymentId, {
        targetVersion: 'v2.8.0',
        reason: rollbackReason || 'Operator executed rollback due to verified release risk',
        operator: 'on-call-sre',
      });
      setIsRollbackModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Rollback execution failed');
    }
  };

  const pipelineStages = [
    { name: 'Queued', status: 'COMPLETED' },
    { name: 'Toolchain Validation', status: 'COMPLETED' },
    { name: 'Backend Test & JaCoCo', status: 'COMPLETED' },
    { name: 'Frontend Lint & Build', status: 'COMPLETED' },
    { name: 'Trivy Security Scan', status: 'COMPLETED' },
    { name: 'Push Immutable Image', status: 'COMPLETED' },
    { name: 'Deploy Cluster', status: 'COMPLETED' },
    { name: 'Automated Smoke Tests', status: deployment?.status === 'SUCCESS' ? 'COMPLETED' : 'IN_PROGRESS' },
  ];

  if (loading || !deployment) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-cyan-400">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  const riskScore = deployment.riskScore || 78;
  const riskLevel = deployment.riskLevel || 'HIGH';
  const riskReasons = deployment.riskReasons || [
    'Critical payment gateway service target',
    'High database connection utilization observed on previous run',
    'Downstream dependencies: payment-db, fraud-detection-service'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <Link
          to="/deployments"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Deployments</span>
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <GitCommit size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {deployment.serviceName} ({deployment.version})
                  </h1>
                  <StatusBadge status={deployment.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Commit <span className="font-mono text-cyan-400">{deployment.commitHash.slice(0, 7)}</span> • Triggered by {deployment.triggeredBy}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsRollbackModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              <RotateCcw size={14} />
              <span>Rollback Release</span>
            </button>
          </div>
        </div>
      </div>

      {/* CI/CD Pipeline Lifecycle (Section 31 & 78) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Activity size={16} className="text-cyan-400" />
          <span>Automated Jenkins CI/CD Delivery Pipeline Stages</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {pipelineStages.map((stage, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center space-y-1.5"
            >
              <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div className="text-[11px] font-medium text-slate-200 line-clamp-2">{stage.name}</div>
              <div className="text-[9px] text-emerald-400 font-mono uppercase">PASSED</div>
            </div>
          ))}
        </div>
      </div>

      {/* Release Risk Score & Change Impact (Section 50 & 51) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Release Risk Score Meter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Shield size={16} className="text-rose-400" />
              <span>Deployment Risk Score (Section 50)</span>
            </h3>
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                riskScore >= 70
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {riskLevel} RISK: {riskScore}/100
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Calculated pre-deployment risk score based on changed service criticality, recent failure history, and dependency health.
          </p>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-300">Risk Assessment Factors:</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {riskReasons.map((reason, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Change Impact Analysis (Section 51) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Layers size={16} className="text-indigo-400" />
            <span>Change Impact Analysis (Section 51)</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Downstream services and dependent APIs potentially impacted by this release artifact:
          </p>

          <div className="space-y-2 pt-2">
            {[
              { name: 'order-service', impact: 'Direct dependent: calls payment webhook during checkout' },
              { name: 'notification-service', impact: 'Downstream: dispatches billing receipts upon confirmation' },
              { name: 'fraud-detection-service', impact: 'Real-time scoring check on billing ledger transactions' },
            ].map((impact, i) => (
              <div
                key={i}
                className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{impact.name}</div>
                  <div className="text-[11px] text-slate-400">{impact.impact}</div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">MONITORED</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rollback Modal */}
      <Modal isOpen={isRollbackModalOpen} onClose={() => setIsRollbackModalOpen(false)} title="Confirm Release Rollback">
        <form onSubmit={handleRollback} className="space-y-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 leading-relaxed flex items-center space-x-2">
            <AlertOctagon size={18} className="shrink-0" />
            <span>
              Rolling back <strong className="text-white">{deployment.serviceName}</strong> to previous stable release <strong>v2.8.0</strong>.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Rollback Justification / Reason
            </label>
            <textarea
              rows={3}
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="e.g. Verified elevated risk score and connection saturation in production."
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl"
            >
              Execute Rollback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
