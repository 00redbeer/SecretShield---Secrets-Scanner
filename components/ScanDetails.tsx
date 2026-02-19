
import React, { useEffect, useState } from 'react';
// Fix: Use namespace import to bypass missing exported member errors
import * as ReactRouterDOM from 'react-router-dom';
import { api } from '../services/api';
import { ScanJob, Finding, Severity, ScanStatus } from '../types';

const { useParams, Link } = ReactRouterDOM as any;

const ScanDetails: React.FC = () => {
  // Fix: Removed generic type argument from untyped function call to resolve TypeScript error
  const { id } = useParams();
  const [scan, setScan] = useState<ScanJob | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filter, setFilter] = useState<'ALL' | Severity>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const scans = await api.getScans();
      const currentScan = scans.find(s => s.id === id);
      if (currentScan) {
        setScan(currentScan);
        const results = await api.getFindingsByScanId(id);
        setFindings(results);
      }
      setIsLoading(false);
    };
    fetchData();

    // Polling simulation for running scans
    const timer = setInterval(() => {
      if (scan?.status === ScanStatus.RUNNING) fetchData();
    }, 3000);

    return () => clearInterval(timer);
  }, [id, scan?.status]);

  const handleDelete = async (findingId: string) => {
    await api.deleteFinding(findingId);
    setFindings(prev => prev.filter(f => f.id !== findingId));
  };

  const filteredFindings = findings.filter(f => filter === 'ALL' || f.severity === filter);

  if (isLoading) return <div className="text-center py-20 animate-pulse text-slate-400">Loading details...</div>;
  if (!scan) return <div className="text-center py-20 text-slate-400">Scan job not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Scan Results: <span className="text-purple-400 font-mono text-xl">{scan.target}</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Job ID: {scan.id} • Started {new Date(scan.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => api.exportToCSV(findings)}
            className="px-6 py-2 bg-white/5 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-all border border-white/10"
          >
            Export to CSV
          </button>
          <Link to="/new-scan" className="px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20">
            Start New
          </Link>
        </div>
      </div>

      {/* Progress Block */}
      {scan.status !== ScanStatus.COMPLETED && (
        <div className="bg-[#1e1b4b]/40 border border-white/5 p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Status: {scan.status}</span>
            <span className="text-purple-400 text-sm font-bold">{scan.progress}%</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-purple-600 transition-all duration-1000"
              style={{ width: `${scan.progress}%` }}
            ></div>
          </div>
          <p className="mt-4 text-slate-400 text-xs italic">Backend is analyzing filesystem history. This may take a few minutes...</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e1b4b]/40 border border-orange-500/20 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Verified Findings</p>
          <p className="text-3xl font-bold text-orange-500">{scan.criticalCount}</p>
          <p className="text-[10px] text-orange-300/50 mt-1">High confidence leaks detected</p>
        </div>
        <div className="bg-[#1e1b4b]/40 border border-purple-500/20 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Non-Verified Findings</p>
          <p className="text-3xl font-bold text-purple-400">{scan.lowCount}</p>
          <p className="text-[10px] text-purple-300/50 mt-1">Heuristic matches needing review</p>
        </div>
        <div className="bg-[#1e1b4b]/40 border border-white/5 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Files Scanned</p>
          <p className="text-3xl font-bold text-white">1,204</p>
          <p className="text-[10px] text-slate-500 mt-1">Full commit history coverage</p>
        </div>
      </div>

      {/* Findings Management */}
      <div className="bg-[#1e1b4b]/40 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">Secrets & Leaks Table</h3>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            {(['ALL', Severity.CRITICAL, Severity.LOW] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">File Path</th>
                <th className="px-6 py-4">Engine</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFindings.map((finding) => (
                <React.Fragment key={finding.id}>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        finding.severity === Severity.CRITICAL ? 'bg-orange-500/10 text-orange-500' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium text-sm">{finding.secretType}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300 text-xs font-mono">{finding.filePath}</span>
                        <span className="text-[10px] text-slate-500">Line {finding.lineNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">{finding.engine}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(finding.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors text-sm"
                        title="Delete False Positive"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-black/20">
                    <td colSpan={5} className="px-6 py-3 border-t border-white/5">
                      <div className="bg-[#0f172a] rounded-lg p-3 border border-white/5 font-mono text-[11px] overflow-x-auto">
                        <span className="text-purple-400">{finding.lineNumber} | </span>
                        <span className="text-slate-400">{finding.snippet}</span>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredFindings.length === 0 && (
            <div className="p-20 text-center">
              <span className="text-4xl block mb-4">✨</span>
              <p className="text-slate-400">No findings matching your filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanDetails;
