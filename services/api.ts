
import { ScanJob, ScanType, ScanStatus, Finding, Severity } from '../types';

// In a real application, these would be calls to your backend server.
// We use localStorage to simulate a persistent state within the 7-day window.

const STORAGE_KEY = 'secret_shield_scans';
const FINDINGS_KEY = 'secret_shield_findings';

const SEED_DATA_KEY = 'secret_shield_seeded';

const seedInitialData = () => {
  if (localStorage.getItem(SEED_DATA_KEY)) return;

  const initialScans: ScanJob[] = [
    {
      id: 'scan-001',
      type: ScanType.REPO,
      target: 'personal-project/e-commerce-backend',
      status: ScanStatus.COMPLETED,
      progress: 100,
      criticalCount: 3,
      lowCount: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    },
    {
      id: 'scan-002',
      type: ScanType.SEED,
      target: 'startup-inc-org',
      status: ScanStatus.COMPLETED,
      progress: 100,
      criticalCount: 1,
      lowCount: 18,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // ~1 day ago
    },
    {
      id: 'scan-003',
      type: ScanType.UPLOAD,
      target: 'legacy-site-backup.zip',
      status: ScanStatus.RUNNING,
      progress: 62,
      criticalCount: 4,
      lowCount: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'scan-004',
      type: ScanType.REPO,
      target: 'competitor-site/private-api',
      status: ScanStatus.FAILED,
      progress: 5,
      criticalCount: 0,
      lowCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    },
    {
      id: 'scan-005',
      type: ScanType.SEED,
      target: 'open-source-foundation',
      status: ScanStatus.QUEUED,
      progress: 0,
      criticalCount: 0,
      lowCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    }
  ];

  const initialFindings: Finding[] = [
    {
      id: 'find-001',
      scanId: 'scan-001',
      source: 'personal-project/e-commerce-backend',
      filePath: 'src/config/database.ts',
      secretType: 'PostgreSQL Password',
      severity: Severity.CRITICAL,
      lineNumber: 22,
      snippet: 'const dbPassword = "super-secret-pw-123!";',
      engine: 'TruffleHog',
      timestamp: new Date().toISOString()
    },
    {
      id: 'find-002',
      scanId: 'scan-001',
      source: 'personal-project/e-commerce-backend',
      filePath: '.env',
      secretType: 'Stripe API Key',
      severity: Severity.CRITICAL,
      lineNumber: 4,
      snippet: 'STRIPE_SECRET=sk_live_51Mz...',
      engine: 'TruffleHog',
      timestamp: new Date().toISOString()
    },
    {
      id: 'find-003',
      scanId: 'scan-002',
      source: 'startup-inc-org',
      filePath: 'infrastructure/terraform/vars.tf',
      secretType: 'AWS Secret Access Key',
      severity: Severity.CRITICAL,
      lineNumber: 85,
      snippet: 'default = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"',
      engine: 'TruffleHog',
      timestamp: new Date().toISOString()
    },
    {
      id: 'find-004',
      scanId: 'scan-002',
      source: 'startup-inc-org',
      filePath: 'docs/onboarding.md',
      secretType: 'Internal Wiki Token',
      severity: Severity.LOW,
      lineNumber: 12,
      snippet: 'Use token "TKN-998877" to access the internal docs.',
      engine: 'Gitleaks',
      timestamp: new Date().toISOString()
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialScans));
  localStorage.setItem(FINDINGS_KEY, JSON.stringify(initialFindings));
  localStorage.setItem(SEED_DATA_KEY, 'true');
};

const getStoredScans = (): ScanJob[] => {
  seedInitialData();
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
    const scanIndex = scans.findIndex(s => s.id === id);
    if (scanIndex === -1) return;

    // Transition to RUNNING
    scans[scanIndex].status = ScanStatus.RUNNING;
    scans[scanIndex].progress = 20;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));

    // Simulate finding results
    setTimeout(() => {
      const currentScans = getStoredScans();
      const sIndex = currentScans.findIndex(job => job.id === id);
      if (sIndex !== -1) {
        currentScans[sIndex].progress = 100;
        currentScans[sIndex].status = ScanStatus.COMPLETED;
        currentScans[sIndex].criticalCount = Math.floor(Math.random() * 5);
        currentScans[sIndex].lowCount = Math.floor(Math.random() * 15);
        
        // Generate findings
        const newFindings: Finding[] = [];
        for (let i = 0; i < currentScans[sIndex].criticalCount; i++) {
          newFindings.push({
            id: Math.random().toString(36).substr(2, 9),
            scanId: id,
            source: currentScans[sIndex].target,
            filePath: `src/auth/config_${i}.js`,
            secretType: 'API Key',
            severity: Severity.CRITICAL,
            lineNumber: 42,
            snippet: 'const KEY = "****************"',
            engine: 'TruffleHog',
            timestamp: new Date().toISOString()
          });
        }
        
        const existingFindings = getStoredFindings();
        localStorage.setItem(FINDINGS_KEY, JSON.stringify([...newFindings, ...existingFindings]));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentScans));
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
