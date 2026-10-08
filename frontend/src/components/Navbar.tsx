import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Search, PlayCircle, ShieldCheck, Leaf, Moon, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DemoOutageModal } from './DemoOutageModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'light-green') setTheme('emerald-dark');
    else if (theme === 'emerald-dark') setTheme('slate-dark');
    else setTheme('light-green');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('payment') || query.includes('service')) {
      navigate('/services');
    } else if (query.includes('deploy') || query.includes('2.8')) {
      navigate('/deployments');
    } else if (query.includes('incident') || query.includes('error')) {
      navigate('/incidents');
    } else {
      navigate('/dashboard');
    }
    setSearchQuery('');
  };

  return (
    <>
      <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                OpsMind AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                PROD
              </span>
            </div>
          </Link>

          {/* Quick Search Input */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <Search size={14} className="absolute left-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, deployments, incidents..."
              className="pl-8 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 transition"
            />
          </form>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Selector Toggle */}
          <button
            onClick={cycleTheme}
            title={`Theme: ${theme}. Click to switch theme.`}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
              theme === 'light-green'
                ? 'bg-emerald-100/90 hover:bg-emerald-200/90 text-emerald-900 border-emerald-300'
                : theme === 'emerald-dark'
                ? 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-700/80'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {theme === 'light-green' ? (
              <>
                <Leaf size={14} className="text-emerald-700" />
                <span className="hidden sm:inline">Light Green</span>
              </>
            ) : theme === 'emerald-dark' ? (
              <>
                <Sparkles size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">Emerald Dark</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-slate-400" />
                <span className="hidden sm:inline">Slate Dark</span>
              </>
            )}
          </button>

          {/* Flagship Demo Outage Simulation Button (Section 90 & 91) */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-600/20 transition"
          >
            <PlayCircle size={14} />
            <span className="hidden sm:inline">Flagship Demo Outage</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Platform: Operational</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-white">{user.fullName || user.username}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {user.roles && user.roles[0] ? user.roles[0].replace('ROLE_', '') : 'DEVELOPER'}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Flagship Outage Simulation Modal */}
      <DemoOutageModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};
