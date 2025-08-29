import { apiClient } from "@/lib/apiClient";
import type { Session, TraceEvent, CreateSessionResponse } from "@/types/domain";

export const SessionApi = {
  // Gestión de sesiones
  create: (payload: { agentId: string }) => 
    apiClient.post<CreateSessionResponse>("/sessions", payload),
    
  get: (id: string) => apiClient.get<Session>(`/sessions/${id}`),
  
  // Nota: No existe GET /sessions en el backend
  // list: () => apiClient.get<Session[]>("/sessions"),
  
  // Control de sesiones (nota: los endpoints usan : en lugar de /)
  pause: (id: string) => apiClient.post<void>(`/sessions/${id}:pause`),
  
  resume: (id: string) => apiClient.post<void>(`/sessions/${id}:resume`),
  
  cancel: (id: string) => apiClient.post<void>(`/sessions/${id}:cancel`),
  
  retryLastStep: (id: string) => apiClient.post<void>(`/sessions/${id}:retryLastStep`),

  // Mensajes
  sendMessage: (id: string, payload: { content: string }) => 
    apiClient.post<void>(`/sessions/${id}/messages`, payload),

  // Traces
  getTrace: (id: string, afterIdx?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (afterIdx !== undefined) params.append('afterIdx', afterIdx.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    const queryString = params.toString();
    return apiClient.get<TraceEvent[]>(`/sessions/${id}/trace${queryString ? `?${queryString}` : ''}`);
  },
  
  // Nota: No existe GET /sessions/{id}/trace/{stepId} en el backend
  // getTraceStep: (id: string, stepId: string) => 
  //   apiClient.get<TraceEvent>(`/sessions/${id}/trace/${stepId}`),
};
