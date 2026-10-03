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

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('opsmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  register: async (payload: { username: string; email: string; password: string; fullName?: string; roles?: string[] }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<UserSummary>>('/auth/me');
    return res.data.data;
  },
};

// Dashboard
export const dashboardApi = {
  getSummary: async () => {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data.data;
  },
};

// Services
export const serviceApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<ServiceEntity[]>>('/services');
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<ServiceEntity>>(`/services/${id}`);
    return res.data.data;
  },
  create: async (payload: Partial<ServiceEntity>) => {
    const res = await apiClient.post<ApiResponse<ServiceEntity>>('/services', payload);
    return res.data.data;
  },
  update: async (id: number, payload: Partial<ServiceEntity>) => {
    const res = await apiClient.put<ApiResponse<ServiceEntity>>(`/services/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/services/${id}`);
    return res.data;
  },
};

// Deployments
export const deploymentApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Deployment[]>>('/deployments');
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<Deployment>>(`/deployments/${id}`);
    return res.data.data;
  },
  create: async (payload: { serviceId: number; version: string; commitHash?: string; environment?: string; triggeredBy?: string }) => {
    const res = await apiClient.post<ApiResponse<Deployment>>('/deployments', payload);
    return res.data.data;
  },
  rollback: async (id: number, payload: { targetVersion?: string; reason: string; operator?: string }) => {
    const res = await apiClient.post<ApiResponse<Deployment>>(`/deployments/${id}/rollback`, payload);
    return res.data.data;
  },
};

// Incidents
export const incidentApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Incident[]>>('/incidents');
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<Incident>>(`/incidents/${id}`);
    return res.data.data;
  },
  create: async (payload: { serviceId: number; title: string; description: string; severity: string; createdBy?: string; assignedTo?: string }) => {
    const res = await apiClient.post<ApiResponse<Incident>>('/incidents', payload);
    return res.data.data;
  },
  updateStatus: async (id: number, payload: { status: string; comment?: string; updatedBy?: string }) => {
    const res = await apiClient.put<ApiResponse<Incident>>(`/incidents/${id}/status`, payload);
    return res.data.data;
  },
  addEvent: async (id: number, payload: { eventType: string; description: string; createdBy?: string }) => {
    const res = await apiClient.post<ApiResponse<void>>(`/incidents/${id}/events`, payload);
    return res.data;
  },
  runAIAnalysis: async (incidentId: number) => {
    const res = await apiClient.post<ApiResponse<AIAnalysis>>(`/incidents/${incidentId}/ai-analysis`);
    return res.data.data;
  },
  getLatestAIAnalysis: async (incidentId: number) => {
    const res = await apiClient.get<ApiResponse<AIAnalysis>>(`/incidents/${incidentId}/ai-analysis/latest`);
    return res.data.data;
  },
};

// Monitoring & Telemetry
export const monitoringApi = {
  getLiveMetrics: async () => {
    const res = await apiClient.get<ApiResponse<SystemMetrics>>('/metrics/live');
    return res.data.data;
  },
  getSnapshots: async (serviceId?: number) => {
    const res = await apiClient.get<ApiResponse<MetricsSnapshot[]>>('/metrics/snapshots', {
      params: serviceId ? { serviceId } : {},
    });
    return res.data.data;
  },
  simulateIncident: async (payload: { serviceName: string; scenario: string }) => {
    const res = await apiClient.post<ApiResponse<Incident>>('/metrics/simulate-incident', payload);
    return res.data.data;
  },
};

// Audit Logs
export const auditApi = {
  getRecentLogs: async () => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs');
    return res.data.data;
  },
};

export default apiClient;
