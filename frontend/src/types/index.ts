export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';

export type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'TESTING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface ServiceEntity {
  id: number;
  name: string;
  description: string;
  repositoryUrl: string;
  environment: string;
  owner: string;
  currentVersion: string;
  healthStatus: HealthStatus;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: number;
  serviceId: number;
  serviceName: string;
  version: string;
  commitHash: string;
  environment: string;
  status: DeploymentStatus;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  rollbackOfId?: number;
  durationSeconds?: number;
  riskScore?: number;
  riskLevel?: string;
  riskReasons?: string[];
}

export interface IncidentEvent {
  id: number;
  incidentId: number;
  eventType: string;
  description: string;
  createdBy: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  serviceId: number;
  serviceName: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  events: IncidentEvent[];
}

export interface AIAnalysis {
  id: number;
  incidentId: number;
  summary: string;
  probableRootCause: string;
  evidence: string[];
  investigationSteps: string[];
  remediationSuggestions: string[];
  confidence: number;
  riskLevel: string;
  modelName: string;
  createdAt: string;
}

export interface MetricsSnapshot {
  id: number;
  serviceId: number;
  serviceName: string;
  latencyMs: number;
  errorRatePercent: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  dbConnectionsUtilizationPercent: number;
  capturedAt: string;
}

export interface SystemMetrics {
  jvmMemoryUsedMb: number;
  jvmMemoryMaxMb: number;
  jvmMemoryUtilizationPercent: number;
  systemCpuUsage: number;
  activeDbConnections: number;
  maxDbConnections: number;
  dbConnectionUtilizationPercent: number;
  totalRequests: number;
  averageResponseTimeMs: number;
  currentErrorRatePercent: number;
  timestamp: string;
}

export interface DashboardSummary {
  totalServices: number;
  healthyServices: number;
  totalDeployments: number;
  deploymentSuccessRate: number;
  activeIncidents: number;
  criticalIncidents: number;
  systemAvailability: number;
  currentErrorRate: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  cpuUtilization: number;
  memoryUtilization: number;
  deploymentFrequency: string;
  leadTimeForChanges: string;
  changeFailureRate: number;
  meanTimeToRestore: string;
  activeIncidentList: Incident[];
  recentDeployments: Deployment[];
}

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface WorkspaceTab {
  id: string;
  title: string;
  path: string;
  closable?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
