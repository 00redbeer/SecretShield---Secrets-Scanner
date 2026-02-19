
import React from 'react';
// Fix: Use namespace import to bypass missing exported member errors in problematic environments
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useLocation } = ReactRouterDOM as any;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'New Scan', path: '/new-scan', icon: '🔍' },
    { label: 'History', path: '/history', icon: '🕒' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1b4b] border-r border-purple-900/50 hidden md:flex flex-col shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-orange-500/20">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SecretShield</h1>
            <p className="text-[10px] text-purple-400 font-medium uppercase tracking-widest">Scanner UI</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-slate-400 mb-2">SCANNING POWER</p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-purple-600 w-3/4"></div>
            </div>
            <p className="text-[10px] mt-2 text-purple-400">75% Usage Reached</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
             <span>Platform</span> / <span className="text-white font-medium capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-600/30 rounded-lg text-sm font-medium hover:bg-purple-600/20 transition-all">
              API Active
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              👤
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0f172a] scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
