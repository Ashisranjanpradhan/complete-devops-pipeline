import React, { useEffect, useState } from 'react';
import { monitoringApi, serviceApi } from '../services/api';
import { SystemMetrics, MetricsSnapshot, ServiceEntity } from '../types';
import { StatCard } from '../components/StatCard';
import {
  Activity,
  Cpu,
  Database,
  Server,
  Zap,
  RefreshCw,
  ExternalLink,
  Flame,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Monitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedService, setSelectedService] = useState('payment-service');

  const navigate = useNavigate();

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const [liveRes, snapRes, svcRes] = await Promise.all([
        monitoringApi.getLiveMetrics(),
        monitoringApi.getSnapshots(),
        serviceApi.getAll(),
      ]);
      setMetrics(liveRes);
      setSnapshots(snapRes);
      setServices(svcRes);
    } catch (err) {
      console.error('Failed to load telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const incident = await monitoringApi.simulateIncident({
        serviceName: selectedService,
        scenario: 'DB_LATENCY_EXHAUSTION',
      });
      // Navigate to the newly created simulated incident for immediate AI analysis!
      navigate(`/incidents/${incident.id}`);
    } catch (err) {
      alert('Failed to simulate incident');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Observability & Telemetry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Spring Actuator, Micrometer Prometheus metrics & JVM runtime telemetry
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTelemetry}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* Live System Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="JVM Memory"
          value={`${metrics?.jvmMemoryUtilizationPercent || 58}%`}
          subtitle={`${Math.round(metrics?.jvmMemoryUsedMb || 256)} MB / ${Math.round(metrics?.jvmMemoryMaxMb || 1024)} MB Heap`}
          icon={<Cpu size={20} />}
          highlightColor="purple"
        />
        <StatCard
          title="CPU Utilization"
          value={`${metrics?.systemCpuUsage || 42}%`}
          subtitle="System Load Average"
          icon={<Activity size={20} />}
          highlightColor="blue"
        />
        <StatCard
          title="HikariCP DB Connections"
          value={`${metrics?.activeDbConnections || 8} / ${metrics?.maxDbConnections || 15}`}
          subtitle={`${metrics?.dbConnectionUtilizationPercent || 53.3}% pool utilization`}
          icon={<Database size={20} />}
          highlightColor="amber"
        />
        <StatCard
          title="API Requests"
          value={metrics?.totalRequests ? metrics.totalRequests.toLocaleString() : '142,580'}
          subtitle={`Avg Latency: ${metrics?.averageResponseTimeMs || 240} ms`}
          icon={<Zap size={20} />}
          highlightColor="emerald"
        />
      </div>

      {/* Demonstration Scenario Controller Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Flame size={13} />
              <span>Interview Demo Controller</span>
            </div>
            <h3 className="text-base font-bold text-white">Simulate Production Incident Scenario</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Injects synthetic application degradation (p99 latency surge to 2150ms, 14% error spike, DB pool saturation at 95%) and triggers automated incident alerting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.currentVersion})
                </option>
              ))}
            </select>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Simulating Incident...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Trigger Incident Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Snapshots Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Telemetry Snapshots</h3>
          <span className="text-xs text-slate-400">Captured by Micrometer & Prometheus Agent</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Service</th>
                <th className="py-3 px-6">Latency</th>
                <th className="py-3 px-6">Error Rate</th>
                <th className="py-3 px-6">CPU</th>
                <th className="py-3 px-6">Memory</th>
                <th className="py-3 px-6">DB Pool Saturation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {snapshots.slice(0, 10).map((snap) => (
                <tr key={snap.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-6 text-slate-400">
                    {new Date(snap.capturedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-6 font-medium text-white">{snap.serviceName}</td>
                  <td className="py-3 px-6 font-mono">
                    <span className={snap.latencyMs > 1000 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {snap.latencyMs} ms
                    </span>
                  </td>
                  <td className="py-3 px-6 font-mono">
                    <span className={snap.errorRatePercent > 5.0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {snap.errorRatePercent}%
                    </span>
                  </td>
                  <td className="py-3 px-6 font-mono text-slate-300">{snap.cpuUsagePercent}%</td>
                  <td className="py-3 px-6 font-mono text-slate-300">{snap.memoryUsagePercent}%</td>
                  <td className="py-3 px-6 font-mono">
                    <span
                      className={
                        snap.dbConnectionsUtilizationPercent > 80.0
                          ? 'text-amber-400 font-bold'
                          : 'text-slate-300'
                      }
                    >
                      {snap.dbConnectionsUtilizationPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
