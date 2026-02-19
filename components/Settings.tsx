
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [config, setConfig] = useState({
    endpoint: 'https://api.github.com',
    token: '',
    retention: 7,
    notifications: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Configure your API connections and scanning preferences.</p>
      </div>

      <div className="bg-[#1e1b4b]/40 border border-white/5 rounded-3xl p-8 space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-purple-400">GitHub API Configuration</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">API Endpoint</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                value={config.endpoint}
                onChange={e => setConfig({...config, endpoint: e.target.value})}
              />
              <p className="text-[10px] text-slate-500 italic">Default is public GitHub API. Change for GitHub Enterprise instances.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Token (Optional)</label>
              <input 
                type="password" 
                placeholder="ghp_********************************"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                value={config.token}
                onChange={e => setConfig({...config, token: e.target.value})}
              />
              <p className="text-[10px] text-slate-500 italic">Recommended to avoid rate limits and enable private repository scanning.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-8 border-t border-white/5">
          <h3 className="text-lg font-bold text-orange-500">Data & Privacy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div>
                <h4 className="text-white text-sm font-bold">Retention Window</h4>
                <p className="text-[10px] text-slate-500">How long scan results are persisted on the platform.</p>
              </div>
              <span className="text-white font-mono bg-purple-600 px-3 py-1 rounded-lg text-xs">7 Days</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl opacity-50">
              <div>
                <h4 className="text-white text-sm font-bold">Anonymous Telemetry</h4>
                <p className="text-[10px] text-slate-500">Send anonymized usage stats to improve engines.</p>
              </div>
              <div className="w-10 h-6 bg-slate-700 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-600/20"
        >
          {saved ? 'Settings Saved Successfully! ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
