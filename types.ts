
export enum ScanStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ScanType {
  SEED = 'SEED',
  REPO = 'REPO',
  UPLOAD = 'UPLOAD'
}

export enum Severity {
  CRITICAL = 'CRITICAL',
  LOW = 'LOW'
}

export interface Finding {
  id: string;
  scanId: string;
  source: string;
  filePath: string;
  secretType: string;
  severity: Severity;
  lineNumber?: number;
  snippet?: string;
  engine: string;
  timestamp: string;
}

export interface ScanJob {
  id: string;
  type: ScanType;
  target: string;
  status: ScanStatus;
  progress: number;
  criticalCount: number;
  lowCount: number;
  createdAt: string;
}

export interface GitHubConfig {
  endpoint: string;
  token?: string;
}
