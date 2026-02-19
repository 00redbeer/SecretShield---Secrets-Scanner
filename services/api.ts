
import { ScanJob, ScanType, ScanStatus, Finding, Severity } from '../types';

// In a real application, these would be calls to your backend server.
// We use localStorage to simulate a persistent state within the 7-day window.

const STORAGE_KEY = 'secret_shield_scans';
const FINDINGS_KEY = 'secret_shield_findings';

const getStoredScans = (): ScanJob[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  const scans: ScanJob[] = JSON.parse(data);
  // 7-day retention logic: filter out scans older than 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return scans.filter(s => new Date(s.createdAt) > sevenDaysAgo);
};

const getStoredFindings = (): Finding[] => {
  const data = localStorage.getItem(FINDINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const api = {
  getScans: async (): Promise<ScanJob[]> => {
    return getStoredScans();
  },

  submitScan: async (type: ScanType, target: string): Promise<ScanJob> => {
    const newJob: ScanJob = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      target,
      status: ScanStatus.QUEUED,
      progress: 0,
      criticalCount: 0,
      lowCount: 0,
      createdAt: new Date().toISOString(),
    };

    const scans = getStoredScans();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newJob, ...scans]));

    // Mock background execution
    setTimeout(() => api.simulateScanExecution(newJob.id), 1000);

    return newJob;
  },

  simulateScanExecution: async (id: string) => {
    const scans = getStoredScans();
    const scan = scans.find(s => s.id === id);
    if (!scan) return;

    // Transition to RUNNING
    scan.status = ScanStatus.RUNNING;
    scan.progress = 20;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));

    // Simulate finding results
    setTimeout(() => {
      const updatedScans = getStoredScans();
      const s = updatedScans.find(job => job.id === id);
      if (s) {
        s.progress = 100;
        s.status = ScanStatus.COMPLETED;
        s.criticalCount = Math.floor(Math.random() * 5);
        s.lowCount = Math.floor(Math.random() * 15);
        
        // Generate findings
        const newFindings: Finding[] = [];
        for (let i = 0; i < s.criticalCount; i++) {
          newFindings.push({
            id: Math.random().toString(36).substr(2, 9),
            scanId: id,
            source: s.target,
            filePath: `src/auth/config_${i}.js`,
            secretType: 'AWS Access Key',
            severity: Severity.CRITICAL,
            lineNumber: 42,
            snippet: 'const AWS_KEY = "AKIA****************"',
            engine: 'TruffleHog',
            timestamp: new Date().toISOString()
          });
        }
        for (let i = 0; i < s.lowCount; i++) {
          newFindings.push({
            id: Math.random().toString(36).substr(2, 9),
            scanId: id,
            source: s.target,
            filePath: `docs/test_env.md`,
            secretType: 'Potential API Key',
            severity: Severity.LOW,
            lineNumber: 105,
            snippet: 'export const DEV_KEY = "dummy-value"',
            engine: 'Gitleaks',
            timestamp: new Date().toISOString()
          });
        }
        
        const existingFindings = getStoredFindings();
        localStorage.setItem(FINDINGS_KEY, JSON.stringify([...newFindings, ...existingFindings]));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScans));
      }
    }, 3000);
  },

  getFindingsByScanId: async (scanId: string): Promise<Finding[]> => {
    return getStoredFindings().filter(f => f.scanId === scanId);
  },

  deleteFinding: async (findingId: string) => {
    const findings = getStoredFindings();
    const updated = findings.filter(f => f.id !== findingId);
    localStorage.setItem(FINDINGS_KEY, JSON.stringify(updated));
  },

  exportToCSV: (findings: Finding[]) => {
    const headers = ['Source', 'Path', 'Type', 'Severity', 'Engine', 'Line', 'Snippet'];
    const rows = findings.map(f => [
      f.source,
      f.filePath,
      f.secretType,
      f.severity,
      f.engine,
      f.lineNumber || '',
      f.snippet?.replace(/"/g, '""') || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `findings_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
