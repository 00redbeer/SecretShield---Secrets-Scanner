
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ScanJob } from '../types';
// Fix: Use namespace import to bypass missing Link export error
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const History: React.FC = () => {
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.getScans();
      setScans(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Scan History</h2>
          <p className="text-slate-400 text-sm">Showing scans from the last 7 days (Data Retention window).</p>
        </div>
        <Link to="/new-scan" className="px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all">
          New Scan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scans.map(scan => (
          <Link 
            to={`/scan/${scan.id}`}
            key={scan.id} 
            className="bg-[#1e1b4b]/40 border border-white/5 p-6 rounded-2xl hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                scan.type === 'REPO' ? 'bg-blue-500/10 text-blue-500' :
                scan.type === 'SEED' ? 'bg-orange-500/10 text-orange-500' :
                'bg-purple-500/10 text-purple-400'
              }`}>
                {scan.type === 'REPO' ? '🐙' : scan.type === 'SEED' ? '🌱' : '📁'}
              </div>
              <div>
                <h4 className="text-white font-bold group-hover:text-purple-400 transition-colors">{scan.target}</h4>
                <p className="text-slate-500 text-xs mt-1">Job {scan.id} • {new Date(scan.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">CRITICAL</p>
                <p className="text-xl font-bold text-orange-500">{scan.criticalCount}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">LOW</p>
                <p className="text-xl font-bold text-purple-400">{scan.lowCount}</p>
              </div>
              <div className="text-right">
                 <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                    scan.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                 }`}>
                   {scan.status}
                 </span>
              </div>
            </div>
          </Link>
        ))}
        {scans.length === 0 && !isLoading && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-slate-500">No activity recorded in the last 7 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
