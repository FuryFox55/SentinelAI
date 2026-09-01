export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ThreatCategory = 
  | 'Vishing'
  | 'Phishing'
  | 'QR Malicious'
  | 'Document Forgery'
  | 'SMS Scam'
  | 'Voice Hijack'
  | 'Identity Extortion'
  | 'Credential Theft';

export type IncidentStatus = 'Unresolved' | 'Investigating' | 'Mitigated' | 'Dismissed';

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  category: ThreatCategory;
  severity: SeverityLevel;
  risk_score: number;
  source: string;
  details: {
    title: string;
    description: string;
    threatScore?: number;
    rawPayload?: string;
  };
  created_at: string;
}

export interface Incident {
  id: string;
  report_id: string;
  title: string;
  category: ThreatCategory;
  severity: SeverityLevel;
  risk_score: number;
  status: IncidentStatus;
  assignee_id?: string;
  operator_notes?: string;
  evidence_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: 'Success' | 'Warning' | 'Failure';
}

export interface SystemHealthNode {
  id: string;
  node_name: string;
  status: 'Nominal' | 'Degraded' | 'Offline';
  load_avg: number;
  uptime_seconds: number;
  recorded_at: string;
}

export interface RiskMetrics {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalEvents: number;
  averageRiskIndex: number;
  preventedThreats: number;
}
