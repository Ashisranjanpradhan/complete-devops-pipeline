import React, { useEffect, useState } from 'react';
import { dashboardApi, incidentApi } from '../services/api';
import { DashboardSummary } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { Link } from 'react-router-dom';
import {
  Server,
  GitCommit,
  AlertTriangle,
  Activity,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Synthetic trend points for latency chart
  const telemetryData = [
    { time: '10:00', latency: 175, errors: 0.2, connections: 45 },
    { time: '10:10', latency: 180, errors: 0.3, connections: 52 },
    { time: '10:20', latency: 182, errors: 0.4, connections: 55 },
    { time: '10:30', latency: 320, errors: 1.8, connections: 68 },
    { time: '10:35', latency: 980, errors: 6.2, connections: 82 },
    { time: '10:40', latency: 1850, errors: 12.5, connections: 92 },
    { time: '10:45', latency: 2150, errors: 14.3, connections: 95 },
  ];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3 text-cyan-400">
          <RefreshCw className="animate-spin" size={32} />
          <span className="text-sm">Loading OpsMind telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time deployment tracking, incident intelligence & observability
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/monitoring"
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition"
          >
            <Activity size={14} />
            <span>Live Telemetry</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Services"
          value={`${data?.healthyServices || 0} / ${data?.totalServices || 0}`}
          subtitle={`${data?.healthyServices === data?.totalServices ? 'All microservices healthy' : 'Degraded services detected'}`}
          icon={<Server size={20} />}
          highlightColor={data?.healthyServices === data?.totalServices ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Deployment Success"
          value={`${data?.deploymentSuccessRate || 0}%`}
          subtitle={`${data?.totalDeployments || 0} total releases tracked`}
          icon={<GitCommit size={20} />}
          highlightColor="blue"
        />
        <StatCard
          title="Active Incidents"
          value={data?.activeIncidents || 0}
          subtitle={`${data?.criticalIncidents || 0} High / Critical severity`}
          icon={<AlertTriangle size={20} />}
          highlightColor={data?.activeIncidents ? 'rose' : 'emerald'}
        />
        <StatCard
          title="System Availability"
          value={`${data?.systemAvailability || 99.9}%`}
          subtitle="99.95% Target SLA"
          icon={<Activity size={20} />}
          highlightColor="emerald"
        />
      </div>

      {/* DORA Metrics Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <Gauge className="text-cyan-400" size={20} />
            <h2 className="text-base font-semibold text-white">DORA Engineering Metrics</h2>
          </div>
          <span className="text-xs text-slate-400">Industry Standard DevOps Performance</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Deployment Frequency</span>
            <span className="text-xl font-bold text-white mt-1 block">{data?.deploymentFrequency || '3.2 / day'}</span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">High Performer</span>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Lead Time For Changes</span>
            <span className="text-xl font-bold text-white mt-1 block">{data?.leadTimeForChanges || '18 mins'}</span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">Commit to Production</span>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Change Failure Rate</span>
            <span className="text-xl font-bold text-white mt-1 block">{data?.changeFailureRate || 0}%</span>
            <span className="text-[11px] text-amber-400 mt-0.5 block">&lt; 15% target</span>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Mean Time To Restore (MTTR)</span>
            <span className="text-xl font-bold text-white mt-1 block">{data?.meanTimeToRestore || '14 mins'}</span>
            <span className="text-[11px] text-cyan-400 mt-0.5 block">Incident to Resolution</span>
          </div>
        </div>
      </div>

      {/* Observability Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency & Error Rate Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">API Latency Surge (ms)</h3>
              <p className="text-xs text-slate-400">Correlation with recent payment-service deployment</p>
            </div>
            <div className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
              p99: {data?.p95LatencyMs || 2150} ms
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Database Connection Pool Saturation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">HikariCP Database Pool Utilization (%)</h3>
              <p className="text-xs text-slate-400">Connection saturation driving timeouts</p>
            </div>
            <div className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              Pool: 95%
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="poolGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="connections" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#poolGradient)" name="DB Pool Saturation (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incidents & Deployments Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-amber-400" size={18} />
              <h3 className="text-base font-semibold text-white">Active Incidents</h3>
            </div>
            <Link to="/incidents" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.activeIncidentList && data.activeIncidentList.length > 0 ? (
              data.activeIncidentList.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-xl transition flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                      <span className="text-xs font-mono text-slate-400">{incident.serviceName}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{incident.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{incident.description}</p>
                  </div>
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-lg shadow-md hover:from-cyan-500 hover:to-blue-500 transition"
                  >
                    <Sparkles size={13} />
                    <span>AI Analysis</span>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                No active incidents. Systems are operating normally.
              </div>
            )}
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <GitCommit className="text-blue-400" size={18} />
              <h3 className="text-base font-semibold text-white">Recent Deployments</h3>
            </div>
            <Link to="/deployments" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {data?.recentDeployments && data.recentDeployments.length > 0 ? (
              data.recentDeployments.map((dep) => (
                <div key={dep.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono text-cyan-400">
                      {dep.serviceName.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {dep.serviceName}{' '}
                        <span className="text-xs text-slate-400 font-mono">({dep.version})</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Triggered by {dep.triggeredBy} • Commit {dep.commitHash.slice(0, 7)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={dep.status} />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">No deployments recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
