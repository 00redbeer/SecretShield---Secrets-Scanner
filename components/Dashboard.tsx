
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ScanJob, ScanStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Dashboard: React.FC = () => {
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

  const totalCritical = scans.reduce((acc, s) => acc + s.criticalCount, 0);
  const totalLow = scans.reduce((acc, s) => acc + s.lowCount, 0);
  const completedScans = scans.filter(s => s.status === ScanStatus.COMPLETED).length;

  const severityData = [
    { name: 'Critical', value: totalCritical, color: '#f97316' }, // Orange
    { name: 'Low', value: totalLow, color: '#7c3aed' }, // Purple
  ];

  const recentScansData = scans.slice(0, 7).map(s => ({
    name: s.target.substring(0, 10) + '...',
    critical: s.criticalCount,
    low: s.lowCount
  }));

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-slate-400">Syncing with backend...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', value: scans.length, trend: '+12%', icon: '📡' },
          { label: 'Critical Findings', value: totalCritical, trend: 'Verified', color: 'text-orange-500', icon: '🔥' },
          { label: 'Low Findings', value: totalLow, trend: 'Non-verified', color: 'text-purple-400', icon: '🛡️' },
          { label: 'Completed Jobs', value: completedScans, trend: 'Success', icon: '✅' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e1b4b]/40 border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${stat.color || 'text-slate-400'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color || 'text-white'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1e1b4b]/40 border border-white/5 p-8 rounded-3xl h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Severity Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e1b4b]/40 border border-white/5 p-8 rounded-3xl h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Findings per Scan (Latest 7)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentScansData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="critical" name="Critical" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" name="Low" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans Table Summary */}
      <div className="bg-[#1e1b4b]/40 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Latest Activity</h3>
          <button className="text-purple-400 text-sm hover:underline">View All History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Target / ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Critical</th>
                <th className="px-6 py-4">Low</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {scans.slice(0, 5).map((scan) => (
                <tr key={scan.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">{scan.target}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {scan.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      scan.status === ScanStatus.COMPLETED ? 'bg-green-500/10 text-green-500' :
                      scan.status === ScanStatus.RUNNING ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-orange-500 font-bold">{scan.criticalCount}</td>
                  <td className="px-6 py-4 text-purple-400 font-bold">{scan.lowCount}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {scans.length === 0 && (
            <div className="p-12 text-center text-slate-500 italic">No recent scans found. Start your first scan!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
