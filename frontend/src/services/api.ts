import axios from 'axios';
import {
  ApiResponse,
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
import {
  mockAuthResponse,
  mockUser,
  initialServices,
  initialDeployments,
  initialIncidents,
  initialAIAnalysis,
  initialMetricsSnapshots,
  initialSystemMetrics,
  initialAuditLogs,
  getMockDashboardSummary
} from './mockData';

export const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('opsmind_backend_url');
    if (custom) return custom;
  }
  return '/api/v1';
};

export const setBackendUrl = (url: string) => {
  if (!url || !url.trim()) {
    localStorage.removeItem('opsmind_backend_url');
  } else {
    localStorage.setItem('opsmind_backend_url', url.trim());
  }
};

const apiClient = axios.create({
  baseURL: getBackendUrl(),
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('opsmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.baseURL = getBackendUrl();
  return config;
});

// State store for Demo/GitHub Pages static mode
let mockServices = [...initialServices];
let mockDeployments = [...initialDeployments];
let mockIncidents = [...initialIncidents];
let mockAIAnalyses: Record<number, AIAnalysis> = { 1: initialAIAnalysis };
let mockAuditLogs = [...initialAuditLogs];

// Helper to determine if we are in static demo mode or backend is unreachable
const withFallback = async <T>(apiCall: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (err) {
    console.info('[OpsMind Demo Mode] Backend API unreachable, rendering static telemetry model.');
    return await fallback();
  }
};

// Authentication
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        return res.data.data;
      },
      () => {
        return {
          ...mockAuthResponse,
          user: {
            ...mockUser,
            username: credentials.username || 'admin',
          }
        };
      }
    );
  },
  register: async (payload: { username: string; email: string; password: string; fullName?: string; roles?: string[] }): Promise<AuthResponse> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
        return res.data.data;
      },
      () => {
        return {
          ...mockAuthResponse,
          user: {
            id: Date.now(),
            username: payload.username,
            email: payload.email,
            fullName: payload.fullName || payload.username,
            roles: payload.roles && payload.roles.length > 0 ? payload.roles : ['ROLE_DEVELOPER'],
          }
        };
      }
    );
  },
  getMe: async (): Promise<UserSummary> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<UserSummary>>('/auth/me');
        return res.data.data;
      },
      () => mockUser
    );
  },
};

// Dashboard
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
        return res.data.data;
      },
      () => getMockDashboardSummary(mockServices, mockDeployments, mockIncidents)
    );
  },
};

// Services
export const serviceApi = {
  getAll: async (): Promise<ServiceEntity[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<ServiceEntity[]>>('/services');
        return res.data.data;
      },
      () => [...mockServices]
    );
  },
  getById: async (id: number): Promise<ServiceEntity> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<ServiceEntity>>(`/services/${id}`);
        return res.data.data;
      },
      () => {
        const found = mockServices.find((s) => s.id === Number(id));
        if (!found) throw new Error('Service not found');
        return found;
      }
    );
  },
  create: async (payload: Partial<ServiceEntity>): Promise<ServiceEntity> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<ServiceEntity>>('/services', payload);
        return res.data.data;
      },
      () => {
        const created: ServiceEntity = {
          id: Date.now(),
          name: payload.name || 'new-service',
          description: payload.description || '',
          repositoryUrl: payload.repositoryUrl || '',
          environment: payload.environment || 'production',
          owner: payload.owner || 'engineering',
          currentVersion: payload.currentVersion || 'v1.0.0',
          healthStatus: 'HEALTHY',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockServices = [created, ...mockServices];
        return created;
      }
    );
  },
  update: async (id: number, payload: Partial<ServiceEntity>): Promise<ServiceEntity> => {
    return withFallback(
      async () => {
        const res = await apiClient.put<ApiResponse<ServiceEntity>>(`/services/${id}`, payload);
        return res.data.data;
      },
      () => {
        mockServices = mockServices.map((s) => (s.id === Number(id) ? { ...s, ...payload, updatedAt: new Date().toISOString() } : s));
        const updated = mockServices.find((s) => s.id === Number(id));
        return updated!;
      }
    );
  },
  delete: async (id: number): Promise<void> => {
    return withFallback(
      async () => {
        await apiClient.delete<ApiResponse<void>>(`/services/${id}`);
      },
      () => {
        mockServices = mockServices.filter((s) => s.id !== Number(id));
      }
    );
  },
  getDependencies: async (id: number): Promise<string[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<string[]>>(`/services/${id}/dependencies`);
        return res.data.data;
      },
      () => {
        const s = mockServices.find((svc) => svc.id === Number(id));
        return s?.name === 'payment-service'
          ? ['payment-db', 'fraud-detection-service', 'notification-service']
          : ['postgres-db', 'internal-gateway'];
      }
    );
  },
};

// Deployments
export const deploymentApi = {
  getAll: async (): Promise<Deployment[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<Deployment[]>>('/deployments');
        return res.data.data;
      },
      () => [...mockDeployments]
    );
  },
  getById: async (id: number): Promise<Deployment> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<Deployment>>(`/deployments/${id}`);
        return res.data.data;
      },
      () => {
        const d = mockDeployments.find((dep) => dep.id === Number(id));
        if (!d) throw new Error('Deployment not found');
        return d;
      }
    );
  },
  create: async (payload: { serviceId: number; version: string; commitHash?: string; environment?: string; triggeredBy?: string }): Promise<Deployment> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<Deployment>>('/deployments', payload);
        return res.data.data;
      },
      () => {
        const s = mockServices.find((svc) => svc.id === Number(payload.serviceId));
        const created: Deployment = {
          id: Date.now(),
          serviceId: Number(payload.serviceId),
          serviceName: s ? s.name : 'service',
          version: payload.version,
          commitHash: payload.commitHash || Math.random().toString(16).substring(2, 9),
          environment: payload.environment || 'production',
          status: 'SUCCESS',
          triggeredBy: payload.triggeredBy || 'Jenkins',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        mockDeployments = [created, ...mockDeployments];
        if (s) {
          s.currentVersion = payload.version;
        }
        return created;
      }
    );
  },
  rollback: async (id: number, payload: { targetVersion?: string; reason: string; operator?: string }): Promise<Deployment> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<Deployment>>(`/deployments/${id}/rollback`, payload);
        return res.data.data;
      },
      () => {
        const current = mockDeployments.find((d) => d.id === Number(id));
        const targetVer = payload.targetVersion || 'v2.8.0';
        if (current) {
          current.status = 'ROLLED_BACK';
        }
        const rollbackDep: Deployment = {
          id: Date.now(),
          serviceId: current ? current.serviceId : 1,
          serviceName: current ? current.serviceName : 'payment-service',
          version: targetVer,
          commitHash: 'rollback-' + Math.random().toString(16).substring(2, 8),
          environment: current ? current.environment : 'production',
          status: 'SUCCESS',
          triggeredBy: payload.operator || 'devops',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          rollbackOfId: Number(id),
        };
        mockDeployments = [rollbackDep, ...mockDeployments];
        const s = mockServices.find((svc) => svc.id === (current ? current.serviceId : 1));
        if (s) {
          s.currentVersion = targetVer;
          s.healthStatus = 'HEALTHY';
        }
        return rollbackDep;
      }
    );
  },
};

// Incidents
export const incidentApi = {
  getAll: async (): Promise<Incident[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<Incident[]>>('/incidents');
        return res.data.data;
      },
      () => [...mockIncidents]
    );
  },
  getById: async (id: number): Promise<Incident> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<Incident>>(`/incidents/${id}`);
        return res.data.data;
      },
      () => {
        const inc = mockIncidents.find((i) => i.id === Number(id));
        if (!inc) throw new Error('Incident not found');
        return inc;
      }
    );
  },
  create: async (payload: { serviceId: number; title: string; description: string; severity: string; createdBy?: string; assignedTo?: string }): Promise<Incident> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<Incident>>('/incidents', payload);
        return res.data.data;
      },
      () => {
        const s = mockServices.find((svc) => svc.id === Number(payload.serviceId));
        const created: Incident = {
          id: Date.now(),
          serviceId: Number(payload.serviceId),
          serviceName: s ? s.name : 'service',
          title: payload.title,
          description: payload.description,
          severity: payload.severity as any,
          status: 'OPEN',
          createdBy: payload.createdBy || 'Alertmanager',
          assignedTo: payload.assignedTo || 'devops',
          createdAt: new Date().toISOString(),
          events: [
            {
              id: Date.now(),
              incidentId: Date.now(),
              eventType: 'CREATED',
              description: payload.title,
              createdBy: payload.createdBy || 'Alertmanager',
              timestamp: new Date().toISOString(),
            }
          ],
        };
        mockIncidents = [created, ...mockIncidents];
        if (s) {
          s.healthStatus = 'DEGRADED';
        }
        return created;
      }
    );
  },
  updateStatus: async (id: number, payload: { status: string; comment?: string; updatedBy?: string }): Promise<Incident> => {
    return withFallback(
      async () => {
        const res = await apiClient.put<ApiResponse<Incident>>(`/incidents/${id}/status`, payload);
        return res.data.data;
      },
      () => {
        const inc = mockIncidents.find((i) => i.id === Number(id));
        if (inc) {
          inc.status = payload.status as any;
          if (payload.status === 'RESOLVED' || payload.status === 'CLOSED') {
            inc.resolvedAt = new Date().toISOString();
            const s = mockServices.find((svc) => svc.id === inc.serviceId);
            if (s) s.healthStatus = 'HEALTHY';
          }
          inc.events.push({
            id: Date.now(),
            incidentId: inc.id,
            eventType: 'STATUS_CHANGE',
            description: `Status changed to ${payload.status}${payload.comment ? ' - ' + payload.comment : ''}`,
            createdBy: payload.updatedBy || 'devops',
            timestamp: new Date().toISOString(),
          });
        }
        return inc!;
      }
    );
  },
  addEvent: async (id: number, payload: { eventType: string; description: string; createdBy?: string }): Promise<void> => {
    return withFallback(
      async () => {
        await apiClient.post<ApiResponse<void>>(`/incidents/${id}/events`, payload);
      },
      () => {
        const inc = mockIncidents.find((i) => i.id === Number(id));
        if (inc) {
          inc.events.push({
            id: Date.now(),
            incidentId: inc.id,
            eventType: payload.eventType,
            description: payload.description,
            createdBy: payload.createdBy || 'devops',
            timestamp: new Date().toISOString(),
          });
        }
      }
    );
  },
  runAIAnalysis: async (incidentId: number): Promise<AIAnalysis> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<AIAnalysis>>(`/incidents/${incidentId}/ai-analysis`);
        return res.data.data;
      },
      () => {
        const analysis: AIAnalysis = {
          ...initialAIAnalysis,
          id: Date.now(),
          incidentId: Number(incidentId),
          createdAt: new Date().toISOString(),
        };
        mockAIAnalyses[Number(incidentId)] = analysis;
        return analysis;
      }
    );
  },
  getLatestAIAnalysis: async (incidentId: number): Promise<AIAnalysis> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<AIAnalysis>>(`/incidents/${incidentId}/ai-analysis/latest`);
        return res.data.data;
      },
      () => {
        const found = mockAIAnalyses[Number(incidentId)] || initialAIAnalysis;
        return found;
      }
    );
  },
};

// Monitoring & Telemetry
export const monitoringApi = {
  getLiveMetrics: async (): Promise<SystemMetrics> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<SystemMetrics>>('/metrics/live');
        return res.data.data;
      },
      () => ({
        ...initialSystemMetrics,
        timestamp: new Date().toISOString(),
      })
    );
  },
  getSnapshots: async (serviceId?: number): Promise<MetricsSnapshot[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<MetricsSnapshot[]>>('/metrics/snapshots', {
          params: serviceId ? { serviceId } : {},
        });
        return res.data.data;
      },
      () => (serviceId ? initialMetricsSnapshots.filter((m) => m.serviceId === Number(serviceId)) : initialMetricsSnapshots)
    );
  },
  simulateIncident: async (payload: { serviceName: string; scenario: string }): Promise<Incident> => {
    return withFallback(
      async () => {
        const res = await apiClient.post<ApiResponse<Incident>>('/metrics/simulate-incident', payload);
        return res.data.data;
      },
      () => {
        const sim: Incident = {
          id: Date.now(),
          serviceId: 1,
          serviceName: payload.serviceName || 'payment-service',
          title: `Simulation: ${payload.scenario}`,
          description: `Simulated anomaly triggered via telemetry load generator: ${payload.scenario}`,
          severity: 'HIGH',
          status: 'OPEN',
          createdBy: 'Simulator',
          createdAt: new Date().toISOString(),
          events: [
            {
              id: Date.now(),
              incidentId: Date.now(),
              eventType: 'SIMULATION',
              description: `Generated ${payload.scenario} event`,
              createdBy: 'Simulator',
              timestamp: new Date().toISOString(),
            }
          ],
        };
        mockIncidents = [sim, ...mockIncidents];
        return sim;
      }
    );
  },
};

// Audit Logs
export const auditApi = {
  getRecentLogs: async (): Promise<AuditLog[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs');
        return res.data.data;
      },
      () => [...mockAuditLogs]
    );
  },
};

export default apiClient;
