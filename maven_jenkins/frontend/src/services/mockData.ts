import {
  AuthResponse,
  DashboardSummary,
  Deployment,
  Incident,
  AIAnalysis,
  MetricsSnapshot,
  ServiceEntity,
  SystemMetrics,
  AuditLog,
  UserSummary
} from '../types';

export const mockUser: UserSummary = {
  id: 1,
  username: 'admin',
  email: 'admin@opsmind.io',
  fullName: 'OpsMind Administrator',
  roles: ['ROLE_ADMIN', 'ROLE_DEVOPS_ENGINEER'],
};

export const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token-opsmind-demo',
  tokenType: 'Bearer',
  user: mockUser,
};

export const initialServices: ServiceEntity[] = [
  {
    id: 1,
    name: 'payment-service',
    description: 'Handles billing, subscriptions, and payment gateway webhooks',
    repositoryUrl: 'https://github.com/company/payment-service',
    environment: 'production',
    owner: 'payments-team',
    currentVersion: 'v2.8.1',
    healthStatus: 'DEGRADED',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 2,
    name: 'auth-service',
    description: 'Authentication, OAuth2 tokens, and user credentials provider',
    repositoryUrl: 'https://github.com/company/auth-service',
    environment: 'production',
    owner: 'security-team',
    currentVersion: 'v1.4.2',
    healthStatus: 'HEALTHY',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    name: 'order-service',
    description: 'Order lifecycle processing, cart management, and inventory checkout',
    repositoryUrl: 'https://github.com/company/order-service',
    environment: 'staging',
    owner: 'orders-team',
    currentVersion: 'v3.1.0',
    healthStatus: 'HEALTHY',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 4,
    name: 'notification-service',
    description: 'Transactional emails, SMS dispatch, and Slack alert integrations',
    repositoryUrl: 'https://github.com/company/notification-service',
    environment: 'production',
    owner: 'core-team',
    currentVersion: 'v1.0.5',
    healthStatus: 'HEALTHY',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const initialDeployments: Deployment[] = [
  {
    id: 1,
    serviceId: 1,
    serviceName: 'payment-service',
    version: 'v2.8.1',
    commitHash: 'a72f93c',
    environment: 'production',
    status: 'SUCCESS',
    triggeredBy: 'Jenkins',
    startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 21 * 60000).toISOString(),
  },
  {
    id: 2,
    serviceId: 2,
    serviceName: 'auth-service',
    version: 'v1.4.2',
    commitHash: 'c398a10',
    environment: 'production',
    status: 'SUCCESS',
    triggeredBy: 'Jenkins',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86400000 + 180000).toISOString(),
  },
  {
    id: 3,
    serviceId: 1,
    serviceName: 'payment-service',
    version: 'v2.8.0',
    commitHash: 'e5c9b12',
    environment: 'production',
    status: 'SUCCESS',
    triggeredBy: 'Jenkins',
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 86400000 + 240000).toISOString(),
  },
  {
    id: 4,
    serviceId: 3,
    serviceName: 'order-service',
    version: 'v3.1.0',
    commitHash: 'f4d92a1',
    environment: 'staging',
    status: 'SUCCESS',
    triggeredBy: 'Operator',
    startedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 86400000 + 300000).toISOString(),
  },
];

export const initialIncidents: Incident[] = [
  {
    id: 1,
    serviceId: 1,
    serviceName: 'payment-service',
    title: 'Payment API 5xx errors spiked to 14% with high DB connection utilization',
    description:
      'Payment API p99 latency surged from 180ms to 2.1s. 5xx errors increased from 0.4% to 14%. HikariCP connection pool saturated at 94% following deployment v2.8.1.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    createdBy: 'Alertmanager',
    assignedTo: 'devops',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    events: [
      {
        id: 1,
        incidentId: 1,
        eventType: 'DEPLOYMENT',
        description: 'payment-service v2.8.1 deployed to production by Jenkins pipeline #142',
        createdBy: 'Jenkins',
        timestamp: new Date(Date.now() - 21 * 60000).toISOString(),
      },
      {
        id: 2,
        incidentId: 1,
        eventType: 'ALERT_TRIGGERED',
        description: 'HighLatencyAlert: p99 latency exceeded 2000ms threshold (measured 2100ms)',
        createdBy: 'Alertmanager',
        timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
      },
      {
        id: 3,
        incidentId: 1,
        eventType: 'ALERT_TRIGGERED',
        description: 'HighErrorRateAlert: 5xx error rate exceeded 5% threshold (measured 14%)',
        createdBy: 'Alertmanager',
        timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: 4,
        incidentId: 1,
        eventType: 'STATUS_CHANGE',
        description: 'Incident status moved to INVESTIGATING by on-call engineer',
        createdBy: 'devops',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      },
    ],
  },
];

export const initialAIAnalysis: AIAnalysis = {
  id: 1,
  incidentId: 1,
  summary:
    'Critical degradation detected on payment-service: HTTP error rate spiked to 14.1% with latency at 2100ms, strongly correlated with deployment v2.8.1 executed 21 minutes prior.',
  probableRootCause:
    'Latest deployment (v2.8.1) appears to have introduced unindexed database queries or connection leaks, driving HikariCP connection pool utilization to 94.0% and causing downstream HTTP request timeouts.',
  evidence: [
    '1. Deployment v2.8.1 was completed 21 minutes before error spike began.',
    '2. Database connection pool utilization reached 94.0% (saturation threshold is 80%).',
    '3. API p99 latency surged from baseline ~180ms to 2100ms.',
    '4. HTTP 5xx error rate increased to 14.1% due to connection acquire timeouts.',
  ],
  investigationSteps: [
    '1. Inspect database connection pool metrics (HikariCP active vs idle connections and acquire wait times).',
    '2. Review git diff between v2.8.1 and previous release for missing database indexes or unclosed transactions.',
    '3. Check PostgreSQL pg_stat_activity for long-running transactions and locks.',
    '4. Verify database CPU and I/O wait times in AWS RDS / Grafana database dashboard.',
  ],
  remediationSuggestions: [
    '1. Consider rolling back payment-service to previous stable version (v2.8.0) if customer impact continues.',
    '2. Temporarily increase maximum database connection pool size if the database instance has sufficient memory.',
    '3. Apply query statement timeout to prevent pool starvation.',
  ],
  confidence: 0.94,
  riskLevel: 'CRITICAL',
  modelName: 'opsmind-ai-correlator-v1',
  createdAt: new Date().toISOString(),
};

export const initialMetricsSnapshots: MetricsSnapshot[] = [
  {
    id: 1,
    serviceId: 1,
    serviceName: 'payment-service',
    latencyMs: 180,
    errorRatePercent: 0.4,
    cpuUsagePercent: 32.5,
    memoryUsagePercent: 48.0,
    dbConnectionsUtilizationPercent: 55.0,
    capturedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 2,
    serviceId: 1,
    serviceName: 'payment-service',
    latencyMs: 185,
    errorRatePercent: 0.4,
    cpuUsagePercent: 34.0,
    memoryUsagePercent: 49.5,
    dbConnectionsUtilizationPercent: 56.0,
    capturedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 3,
    serviceId: 1,
    serviceName: 'payment-service',
    latencyMs: 850,
    errorRatePercent: 4.2,
    cpuUsagePercent: 58.0,
    memoryUsagePercent: 65.0,
    dbConnectionsUtilizationPercent: 78.0,
    capturedAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 4,
    serviceId: 1,
    serviceName: 'payment-service',
    latencyMs: 2100,
    errorRatePercent: 14.1,
    cpuUsagePercent: 74.0,
    memoryUsagePercent: 78.5,
    dbConnectionsUtilizationPercent: 94.0,
    capturedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 5,
    serviceId: 1,
    serviceName: 'payment-service',
    latencyMs: 2150,
    errorRatePercent: 14.3,
    cpuUsagePercent: 76.0,
    memoryUsagePercent: 81.0,
    dbConnectionsUtilizationPercent: 95.0,
    capturedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export const initialSystemMetrics: SystemMetrics = {
  jvmMemoryUsedMb: 612,
  jvmMemoryMaxMb: 1024,
  jvmMemoryUtilizationPercent: 59.7,
  systemCpuUsage: 34.2,
  activeDbConnections: 14,
  maxDbConnections: 15,
  dbConnectionUtilizationPercent: 93.3,
  totalRequests: 42180,
  averageResponseTimeMs: 145,
  currentErrorRatePercent: 3.8,
  timestamp: new Date().toISOString(),
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: 1,
    username: 'jenkins',
    action: 'DEPLOYMENT_COMPLETED',
    resource: 'payment-service:v2.8.1',
    details: 'Automated deployment succeeded in 4 minutes',
    ipAddress: '10.0.1.5',
    timestamp: new Date(Date.now() - 21 * 60000).toISOString(),
  },
  {
    id: 2,
    username: 'system',
    action: 'INCIDENT_CREATED',
    resource: 'incident:payment-service',
    details: 'Incident opened due to prometheus high error rate alert',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: 3,
    username: 'devops',
    action: 'INCIDENT_UPDATED',
    resource: 'incident:payment-service',
    details: 'Status changed from OPEN to INVESTIGATING',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 4,
    username: 'devops',
    action: 'AI_ANALYSIS_REQUESTED',
    resource: 'incident:1:ai-analysis',
    details: 'Triggered AI incident root-cause analysis (confidence: 94%)',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
  },
];

export const getMockDashboardSummary = (
  services: ServiceEntity[],
  deployments: Deployment[],
  incidents: Incident[]
): DashboardSummary => {
  const activeInc = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
  const criticalInc = activeInc.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const healthyCount = services.filter((s) => s.healthStatus === 'HEALTHY').length;
  const successfulDeployments = deployments.filter((d) => d.status === 'SUCCESS').length;

  return {
    totalServices: services.length,
    healthyServices: healthyCount,
    totalDeployments: deployments.length,
    deploymentSuccessRate: deployments.length > 0 ? (successfulDeployments / deployments.length) * 100 : 100,
    activeIncidents: activeInc.length,
    criticalIncidents: criticalInc.length,
    systemAvailability: 99.82,
    currentErrorRate: 3.8,
    averageLatencyMs: 185,
    p95LatencyMs: 420,
    cpuUtilization: 34.2,
    memoryUtilization: 59.7,
    deploymentFrequency: '3.2 / day',
    leadTimeForChanges: '42 mins',
    changeFailureRate: 12.5,
    meanTimeToRestore: '14 mins',
    activeIncidentList: activeInc,
    recentDeployments: deployments.slice(0, 5),
  };
};
