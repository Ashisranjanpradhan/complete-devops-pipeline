import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WorkspaceTab } from '../types';
import { X, ExternalLink, LayoutDashboard, Server, GitCommit, AlertTriangle, Activity, Terminal, Shield, Settings } from 'lucide-react';

const STORAGE_KEY = 'opsmind_workspace_tabs';

export const WorkspaceTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabs, setTabs] = useState<WorkspaceTab[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return [{ id: 'dashboard', title: 'Dashboard', path: '/dashboard', closable: false }];
  });

  // Resolve current route tab title
  const getTabTitleForPath = (path: string): string => {
    if (path.startsWith('/incidents/')) {
      const id = path.split('/')[2];
      return `Incident #${id}`;
    }
    if (path.startsWith('/deployments/')) {
      const id = path.split('/')[2];
      return `Deployment #${id}`;
    }
    if (path.startsWith('/services/')) {
      const id = path.split('/')[2];
      return `Service #${id}`;
    }
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/services')) return 'Services';
    if (path.startsWith('/deployments')) return 'Deployments';
    if (path.startsWith('/incidents')) return 'Incidents';
    if (path.startsWith('/monitoring')) return 'Observability';
    if (path.startsWith('/ai-assistant')) return 'AI Assistant';
    if (path.startsWith('/audit')) return 'Audit Trail';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Overview';
  };

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/login' || currentPath === '/') return;

    setTabs((prev) => {
      const existing = prev.find((t) => t.path === currentPath);
      if (existing) return prev;

      const title = getTabTitleForPath(currentPath);
      const newTab: WorkspaceTab = {
        id: currentPath,
        title,
        path: currentPath,
        closable: currentPath !== '/dashboard',
      };
      const updated = [...prev, newTab];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [location.pathname]);

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tabToClose = tabs.find((t) => t.id === id);
    if (!tabToClose || !tabToClose.closable) return;

    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    } catch (e) {}

    if (location.pathname === tabToClose.path) {
      const fallback = remaining[remaining.length - 1] || { path: '/dashboard' };
      navigate(fallback.path);
    }
  };

  const handleOpenInNewBrowserTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    // Normal browser new tab using window.open on hash route
    const fullUrl = `${window.location.origin}${window.location.pathname}#${path}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const getTabIcon = (path: string) => {
    if (path.includes('incident')) return <AlertTriangle size={13} className="text-amber-400" />;
    if (path.includes('deployment')) return <GitCommit size={13} className="text-blue-400" />;
    if (path.includes('service')) return <Server size={13} className="text-cyan-400" />;
    if (path.includes('monitoring')) return <Activity size={13} className="text-emerald-400" />;
    if (path.includes('ai-assistant')) return <Terminal size={13} className="text-indigo-400" />;
    if (path.includes('settings')) return <Settings size={13} className="text-slate-400" />;
    return <LayoutDashboard size={13} className="text-cyan-400" />;
  };

  if (location.pathname === '/login') return null;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 pt-2 flex items-center space-x-1 overflow-x-auto select-none no-scrollbar">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <div
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer border-t border-x transition-all ${
              isActive
                ? 'bg-slate-950 text-white border-slate-700/80 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            {getTabIcon(tab.path)}
            <span>{tab.title}</span>

            {/* Open in new browser tab action (Section 13 Layer 2) */}
            <button
              onClick={(e) => handleOpenInNewBrowserTab(e, tab.path)}
              title="Open in new browser tab ↗"
              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-400 transition"
            >
              <ExternalLink size={11} />
            </button>

            {/* Close tab */}
            {tab.closable && (
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                title="Close tab"
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded transition"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
