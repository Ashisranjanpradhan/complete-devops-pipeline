import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { incidentApi, deploymentApi } from '../services/api';
import { Incident, AIAnalysis, IncidentStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  HelpCircle,
  Wrench,
  Search,
  RotateCcw,
  RefreshCw,
  Send,
  AlertOctagon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const incidentId = Number(id);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [newEventText, setNewEventText] = useState('');
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');

  const fetchIncidentDetails = async () => {
    try {
      setLoading(true);
      const res = await incidentApi.getById(incidentId);
      setIncident(res);

      // Attempt to load existing AI analysis
      try {
        const aiRes = await incidentApi.getLatestAIAnalysis(incidentId);
        setAiAnalysis(aiRes);
      } catch (e) {
        // No analysis generated yet, that's fine
      }
    } catch (err) {
      console.error('Failed to load incident', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) {
      fetchIncidentDetails();
    }
  }, [incidentId]);

  const handleRunAI = async () => {
    try {
      setAiLoading(true);
      const res = await incidentApi.runAIAnalysis(incidentId);
      setAiAnalysis(res);
      fetchIncidentDetails();
    } catch (err) {
      alert('Failed to execute AI analysis');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await incidentApi.updateStatus(incidentId, {
        status: newStatus,
        comment: `Operator changed status to ${newStatus}`,
      });
      fetchIncidentDetails();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventText.trim()) return;

    try {
      await incidentApi.addEvent(incidentId, {
        eventType: 'INVESTIGATION_NOTE',
        description: newEventText,
        createdBy: 'on-call-engineer',
      });
      setNewEventText('');
      fetchIncidentDetails();
    } catch (err) {
      alert('Failed to add event');
    }
  };

  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find latest deployment for this service and rollback
      const deployments = await deploymentApi.getAll();
      const targetDep = deployments.find((d) => d.serviceId === incident?.serviceId);
      if (targetDep) {
        await deploymentApi.rollback(targetDep.id, {
          reason: rollbackReason || 'AI analysis confirmed deployment correlation causing connection saturation',
          operator: 'on-call-engineer',
        });
        setIsRollbackModalOpen(false);
        setRollbackReason('');
        // Update incident status to RESOLVED
        await incidentApi.updateStatus(incidentId, {
          status: 'RESOLVED',
          comment: 'Service rolled back successfully. Incident mitigated.',
        });
        fetchIncidentDetails();
      }
    } catch (err) {
      alert('Rollback execution failed');
    }
  };

  // Mock telemetry curve showing pre and post incident
  const chartData = [
    { time: '-30m', latency: 180, dbPool: 55, errors: 0.4 },
    { time: '-25m', latency: 185, dbPool: 56, errors: 0.4 },
    { time: '-20m (Deploy)', latency: 850, dbPool: 78, errors: 4.2 },
    { time: '-15m', latency: 2100, dbPool: 94, errors: 14.1 },
    { time: '-10m', latency: 2150, dbPool: 95, errors: 14.3 },
    { time: '-5m', latency: 2180, dbPool: 96, errors: 14.5 },
  ];

  if (loading || !incident) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-cyan-400">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back button & Header */}
      <div>
        <Link
          to="/incidents"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Incidents</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono text-cyan-400 font-bold">INCIDENT #{incident.id}</span>
              <SeverityBadge severity={incident.severity} />
              <span className="text-xs font-mono text-slate-300 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                {incident.serviceName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{incident.title}</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{incident.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-xs text-slate-400">
              <span className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Status Workflow:</span>
              <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'] as IncidentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      incident.status === st
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Incident Assistant Section */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/10">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>AI Incident Assistant</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Autonomous Correlator
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Correlates recent code deployments, metrics thresholds, telemetry anomalies & logs
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAI}
            disabled={aiLoading}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Correlating Context...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{aiAnalysis ? 'Re-Analyze Incident' : 'Analyze Incident with AI'}</span>
              </>
            )}
          </button>
        </div>

        {/* Safety Disclaimer Banner (README Section 26) */}
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center space-x-2">
          <ShieldAlert size={16} className="shrink-0 text-amber-400" />
          <span>
            <strong>AI Safety Notice:</strong> AI-generated analysis — verify against production evidence before taking action.
          </span>
        </div>

        {aiAnalysis ? (
          <div className="space-y-6">
            {/* Confidence & Model Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-slate-400">Confidence Score:</span>{' '}
                  <span className="font-bold text-emerald-400 font-mono">
                    {Math.round(aiAnalysis.confidence * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Assessed Risk:</span>{' '}
                  <span className="font-bold text-rose-400 font-mono">{aiAnalysis.riskLevel}</span>
                </div>
              </div>
              <div className="text-slate-500 text-[11px] font-mono">
                Model: {aiAnalysis.modelName} • Analyzed at{' '}
                {new Date(aiAnalysis.createdAt).toLocaleTimeString()}
              </div>
            </div>

            {/* Summary & Probable Root Cause */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-cyan-400">
                  <Search size={14} />
                  <span>Incident Summary</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{aiAnalysis.summary}</p>
              </div>

              <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-500/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-rose-400">
                  <AlertTriangle size={14} />
                  <span>Probable Root Cause</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {aiAnalysis.probableRootCause}
                </p>
              </div>
            </div>

            {/* Supporting Evidence */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-300 flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Supporting Evidence Correlated</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiAnalysis.evidence.map((ev, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Investigation & Remediation Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-slate-300 flex items-center space-x-2">
                  <HelpCircle size={14} className="text-blue-400" />
                  <span>Recommended Investigation Steps</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {aiAnalysis.investigationSteps.map((step, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] shrink-0 text-slate-300">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-emerald-400 flex items-center space-x-2 mb-3">
                    <Wrench size={14} />
                    <span>Recommended Remediation</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {aiAnalysis.remediationSuggestions.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Operator Rollback Action */}
                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Identified deployment correlation?</span>
                  <button
                    onClick={() => setIsRollbackModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    <RotateCcw size={13} />
                    <span>Execute Rollback</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
            <Sparkles size={32} className="mx-auto text-cyan-400/60 mb-2" />
            <h4 className="text-sm font-semibold text-white">No AI analysis generated yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Click &quot;Analyze Incident with AI&quot; to aggregate deployments, metrics, and application logs into an evidence-based root-cause hypothesis.
            </p>
          </div>
        )}
      </div>

      {/* Observability Telemetry & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Incident Telemetry Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Telemetry Timeline (Pre/Post Outage)</h3>
              <p className="text-xs text-slate-400">Response latency (ms) & DB Connection pool saturation (%)</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Latency (ms)" />
                <Area type="monotone" dataKey="dbPool" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="DB Pool (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Events Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Incident Timeline & Audit Trail</h3>
              <span className="text-xs text-slate-400">{incident.events?.length || 0} events</span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {incident.events && incident.events.length > 0 ? (
                incident.events.map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-cyan-400 font-mono uppercase">{ev.eventType}</span>
                      <span>
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200">{ev.description}</p>
                    <div className="text-[10px] text-slate-500 mt-1">Reported by: {ev.createdBy}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">No timeline events recorded.</div>
              )}
            </div>
          </div>

          <form onSubmit={handleAddEvent} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value)}
              placeholder="Add investigation finding or note..."
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1"
            >
              <Send size={13} />
              <span>Post</span>
            </button>
          </form>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      <Modal isOpen={isRollbackModalOpen} onClose={() => setIsRollbackModalOpen(false)} title="Execute Service Rollback">
        <form onSubmit={handleRollback} className="space-y-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 leading-relaxed">
            <div className="font-semibold mb-1 flex items-center space-x-1.5">
              <AlertOctagon size={16} />
              <span>Operator Controlled Remediation</span>
            </div>
            Confirming rollback for <strong className="text-white">{incident.serviceName}</strong>. This will deploy the previous stable release artifact and restore database connection stability.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Rollback Justification / Audit Reason
            </label>
            <textarea
              rows={3}
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="e.g. AI-correlated incident confirmed DB connection pool saturation on latest deployment."
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
              Authorize Rollback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
