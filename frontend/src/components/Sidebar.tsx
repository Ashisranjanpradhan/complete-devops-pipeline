import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  GitCommit,
  AlertTriangle,
  Activity,
  History,
  Terminal,
  ExternalLink,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/services', label: 'Services', icon: <Server size={18} /> },
    { to: '/deployments', label: 'Deployments', icon: <GitCommit size={18} /> },
    { to: '/incidents', label: 'Incidents', icon: <AlertTriangle size={18} /> },
    { to: '/monitoring', label: 'Observability', icon: <Activity size={18} /> },
    { to: '/ai-assistant', label: 'AI Assistant', icon: <Terminal size={18} /> },
    { to: '/audit', label: 'Audit Trail', icon: <History size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Platform Integrations
          </div>
          <div className="space-y-1 text-xs">
            <a
              href="http://localhost:9090"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Prometheus</span>
              </span>
              <ExternalLink size={14} />
            </a>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Grafana</span>
              </span>
              <ExternalLink size={14} />
            </a>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>OpenAPI Docs</span>
              </span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center space-x-1.5 mb-1">
            <Terminal size={14} className="text-cyan-400" />
            <span>AI Correlator</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Active correlation engine running. Analyzes metrics & deployments.
          </p>
        </div>
      </div>
    </aside>
  );
};
