
import React, { useState } from 'react';
import { api } from '../services/api';
import { ScanType } from '../types';
// Fix: Use namespace import to bypass missing exported member errors
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

const NewScan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ScanType>(ScanType.SEED);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const navigate = useNavigate();

  const simulateUpload = (fileName: string) => {
    setInputValue(fileName);
    setUploadProgress(0);
    
    const duration = 2000; // 2 seconds simulation
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return (prev || 0) + increment;
      });
    }, intervalTime);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file.name);
    }
  };

  const handleStartScan = async () => {
    if (!inputValue.trim()) return;
    if (activeTab === ScanType.UPLOAD && uploadProgress !== 100) return;
    
    setIsSubmitting(true);
    try {
      const job = await api.submitScan(activeTab, inputValue);
      navigate(`/scan/${job.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: ScanType.SEED, label: 'Seed Scan', desc: 'Domain, Organization, or Keywords' },
    { id: ScanType.REPO, label: 'Repo Scan', desc: 'GitHub URL or Repository Path' },
    { id: ScanType.UPLOAD, label: 'Folder Upload', desc: 'ZIP File Contents Scanning' },
  ];

  const isUploadComplete = activeTab !== ScanType.UPLOAD || (uploadProgress === 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Start New Code Audit</h2>
        <p className="text-slate-400 mt-2">Select a scanning mode to begin identifying exposed secrets and vulnerabilities.</p>
      </div>

      <div className="bg-[#1e1b4b]/40 border border-white/5 rounded-3xl p-8">
        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id); 
                setInputValue(''); 
                setUploadProgress(null);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h4 className="text-xl font-bold text-white">{tabs.find(t => t.id === activeTab)?.label}</h4>
            <p className="text-slate-400 text-sm">{tabs.find(t => t.id === activeTab)?.desc}</p>
          </div>

          <div className="relative group">
            {activeTab === ScanType.UPLOAD ? (
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload" 
                  accept=".zip" 
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer relative z-10">
                  <span className="text-4xl block mb-4">
                    {uploadProgress === 100 ? '✅' : '📦'}
                  </span>
                  <span className="text-lg font-medium text-white">
                    {inputValue || 'Drag and drop ZIP file here'}
                  </span>
                  
                  {uploadProgress !== null && uploadProgress < 100 && (
                    <div className="mt-6 max-w-xs mx-auto space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {uploadProgress === 100 && (
                    <p className="text-green-400 text-xs mt-2 font-medium">Upload complete! Ready to scan.</p>
                  )}
                  
                  {uploadProgress === null && (
                    <p className="text-slate-500 text-xs mt-2">Supported formats: .zip (Max 50MB)</p>
                  )}
                </label>
              </div>
            ) : (
              <input
                type="text"
                placeholder={activeTab === ScanType.REPO ? "https://github.com/user/repo" : "example.com / organization-name"}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all text-lg"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
          </div>

          <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
             <span className="text-orange-500">ℹ️</span>
             <p className="text-xs text-orange-200">
               {activeTab === ScanType.SEED ? 
                "Seed scanning uses recursive discovery. It may take longer depending on the size of the target organization." :
                "Ensure public access is available or configured in Settings for private repositories."}
             </p>
          </div>

          <button
            onClick={handleStartScan}
            disabled={!inputValue || isSubmitting || !isUploadComplete}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
              !inputValue || isSubmitting || !isUploadComplete
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:scale-[1.01] active:scale-[0.99] shadow-orange-500/20'
            }`}
          >
            {isSubmitting ? 'Initializing Job...' : !isUploadComplete ? 'Waiting for Upload...' : 'Execute Full Scan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewScan;
