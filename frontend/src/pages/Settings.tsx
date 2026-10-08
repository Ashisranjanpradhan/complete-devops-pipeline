import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Server, Database, Key, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getBackendUrl, setBackendUrl } from '../services/api';
import axios from 'axios';

export const Settings: React.FC = () => {
  const [backendUrlInput, setBackendUrlInput] = useState<string>(getBackendUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState<string>('');

  const handleSaveBackendUrl = (url: string) => {
    setBackendUrl(url);
    setBackendUrlInput(url);
    setTestMsg('Saved URL. Reloading active sessions...');
    setTimeout(() => window.location.reload(), 600);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMsg('Testing backend connection...');
    try {
      const target = backendUrlInput.endsWith('/api/v1') ? backendUrlInput : `${backendUrlInput.replace(/\/$/, '')}/api/v1`;
      const res = await axios.get(`${target}/dashboard/summary`, { timeout: 4000 });
      if (res.status === 200) {
        setTestStatus('success');
        setTestMsg(`Connected to Spring Boot & PostgreSQL! (Status: 200 OK, Services: ${res.data.totalServices ?? 'Active'})`);
      } else {
        setTestStatus('error');
        setTestMsg(`Received status ${res.status}`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMsg(`Unreachable: ${e.message}. (Ensure backend is running on ${backendUrlInput})`);
    }
  };
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <SettingsIcon className="text-cyan-400" size={24} />
          <span>Platform Settings & Administration</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Role-based access control, AI models, integration endpoints & operational policies
        </p>
      </div>

      {/* RBAC Permission Matrix (Section 6) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Shield size={16} className="text-cyan-400" />
          <span>Role-Based Access Control (RBAC) Matrix (Section 6)</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Fine-grained backend endpoint authorization enforced across all operations.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Action / Operation</th>
                <th className="pb-3 text-center">ROLE_VIEWER</th>
                <th className="pb-3 text-center">ROLE_DEVELOPER</th>
                <th className="pb-3 text-center">ROLE_DEVOPS_ENGINEER</th>
                <th className="pb-3 text-center">ROLE_ADMIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-medium">View Dashboards & Telemetry</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Register & Edit Microservices</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Trigger Deployments & Releases</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Execute Controlled Rollbacks</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Request AI Root-Cause Investigation</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
                <td className="text-center text-emerald-400">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Manage User Roles & System Security</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-rose-500">✕</td>
                <td className="text-center text-emerald-400">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration & AI Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Sliders size={16} className="text-cyan-400" />
            <span>AI Provider & LLM Engine (Section 87)</span>
          </h3>
          <div className="space-y-3 text-xs pt-1">
            <div>
              <label className="text-slate-400 block mb-1">Active AI Provider</label>
              <input
                disabled
                value="Builtin Deterministic + Spring AI Correlator"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Investigation Model</label>
              <input
                disabled
                value="opsmind-ai-correlator-v1 (GPT-4o fallback supported)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Confidence Threshold</label>
              <input
                disabled
                value="0.80 (80% minimum confidence for automated alerts)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Server size={16} className="text-emerald-400" />
              <span>Backend & Local PostgreSQL Integration</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Gateway
            </span>
          </h3>

          <div className="space-y-3 text-xs pt-1">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Backend REST API Endpoint</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                  placeholder="e.g. http://localhost:8080/api/v1 or /api/v1"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw size={13} className={testStatus === 'testing' ? 'animate-spin' : ''} />
                  <span>Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBackendUrl(backendUrlInput)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Save
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Default: <code className="text-slate-400">/api/v1</code> (uses automatic fallback or local proxy)</span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSaveBackendUrl('http://localhost:8080/api/v1')}
                    className="text-cyan-400 hover:underline"
                  >
                    Set to Localhost:8080
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSaveBackendUrl('/api/v1')}
                    className="text-slate-400 hover:underline"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              {testMsg && (
                <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-center space-x-2 border ${
                  testStatus === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : testStatus === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}>
                  {testStatus === 'success' ? <CheckCircle size={14} className="shrink-0 text-emerald-400" /> :
                   testStatus === 'error' ? <AlertCircle size={14} className="shrink-0 text-rose-400" /> :
                   <RefreshCw size={14} className="shrink-0 animate-spin text-cyan-400" />}
                  <span>{testMsg}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div>
                <label className="text-slate-400 block mb-1">Local PostgreSQL Database Connection</label>
                <input
                  disabled
                  value="jdbc:postgresql://localhost:5432/opsmind_db (User: opsmind_user, Flyway V1/V2 active)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Prometheus & Grafana Observability Stacks</label>
                <input
                  disabled
                  value="Prometheus: http://localhost:9090 | Grafana: http://localhost:3000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
