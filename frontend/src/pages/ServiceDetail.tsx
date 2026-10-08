import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceApi, deploymentApi, incidentApi } from '../services/api';
import { ServiceEntity, Deployment, Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  Server,
  ArrowLeft,
  ExternalLink,
  GitCommit,
  AlertTriangle,
  Activity,
  Layers,
  CheckCircle2,
  RefreshCw,
  Clock,
  Shield,
  Network
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const serviceId = Number(id);

  const [service, setService] = useState<ServiceEntity | null>(null);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'deployments' | 'incidents' | 'telemetry'>('overview');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [svcRes, depRes, incRes, depList] = await Promise.all([
        serviceApi.getById(serviceId),
        deploymentApi.getAll(),
        incidentApi.getAll(),
        serviceApi.getDependencies(serviceId),
      ]);
      setService(svcRes);
      setDependencies(depList);
      setDeployments(depRes.filter((d) => d.serviceId === serviceId));
      setIncidents(incRes.filter((i) => i.serviceId === serviceId));
    } catch (err) {
      console.error('Failed to load service detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const telemetryData = [
    { time: '10:00', latency: 180, dbPool: 55, errors: 0.4 },
    { time: '10:15', latency: 185, dbPool: 56, errors: 0.4 },
    { time: '10:30', latency: 850, dbPool: 78, errors: 4.2 },
    { time: '10:45', latency: 2100, dbPool: 94, errors: 14.1 },
    { time: '11:00', latency: 2150, dbPool: 95, errors: 14.3 },
  ];

  if (loading || !service) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-cyan-400">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <Link
          to="/services"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Services Catalog</span>
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Server size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">{service.name}</h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {service.currentVersion}
                  </span>
                  <StatusBadge status={service.healthStatus} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{service.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400 font-mono">Owner: {service.owner}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 uppercase font-mono">{service.environment}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-medium">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'dependencies', label: `Dependencies (${dependencies.length})` },
          { key: 'deployments', label: `Deployments (${deployments.length})` },
          { key: 'incidents', label: `Incidents (${incidents.length})` },
          { key: 'telemetry', label: 'Live Telemetry' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === t.key
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Service Health</span>
            <div className="flex items-center space-x-2">
              <StatusBadge status={service.healthStatus} />
              <span className="text-xs text-slate-300">
                {service.healthStatus === 'HEALTHY' ? 'Operating within SLO' : 'Degradation detected'}
              </span>
            </div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Target Environment</span>
            <div className="text-sm font-semibold text-white font-mono">{service.environment.toUpperCase()}</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Repository URL</span>
            <div className="text-xs text-cyan-400 font-mono truncate">{service.repositoryUrl}</div>
          </div>
        </div>
      )}

      {/* Service Dependencies Mapping (Section 8) */}
      {activeTab === 'dependencies' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Network size={18} className="text-cyan-400" />
            <h3 className="text-sm font-semibold">Service Dependency Graph & Architecture Mapping</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Registered microservices, downstream databases, and dependent APIs communicating with{' '}
            <strong className="text-white">{service.name}</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {dependencies.map((dep, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-mono text-cyan-400">
                    <Layers size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{dep}</div>
                    <div className="text-[10px] text-slate-400">Downstream Dependency</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CONNECTED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === 'deployments' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Deployment History for {service.name}</h3>
          <div className="divide-y divide-slate-800">
            {deployments.length > 0 ? (
              deployments.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{d.version}</div>
                    <div className="text-[11px] text-slate-400">
                      Commit {d.commitHash.slice(0, 7)} • Triggered by {d.triggeredBy}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={d.status} />
                    <Link
                      to={`/deployments/${d.id}`}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">No deployments recorded for this service.</div>
            )}
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Incident Log for {service.name}</h3>
          <div className="space-y-3">
            {incidents.length > 0 ? (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                      <span className="text-xs font-mono text-cyan-400">#{inc.id}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{inc.title}</div>
                    <p className="text-xs text-slate-400">{inc.description}</p>
                  </div>
                  <Link
                    to={`/incidents/${inc.id}`}
                    className="shrink-0 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    View RCA &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">No active or historical incidents.</div>
            )}
          </div>
        </div>
      )}

      {/* Telemetry Tab */}
      {activeTab === 'telemetry' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Live Service Telemetry Curve</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Latency (ms)" />
                <Area type="monotone" dataKey="dbPool" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="DB Pool Saturation (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
