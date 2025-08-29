import { apiClient } from "@/lib/apiClient";
import type { Agent, AgentToolBinding } from "@/types/domain";

export const AgentApi = {
  // CRUD básico
  list: () => apiClient.get<Agent[]>("/agents"),
  
  get: (id: string) => apiClient.get<Agent>(`/agents/${id}`),
  
  create: (payload: Partial<Agent>) => 
    apiClient.post<Agent>("/agents", payload),
    
  patch: (id: string, payload: Partial<Agent>) => 
    apiClient.patch<Agent>(`/agents/${id}`, payload),
    
  // Nota: No existe DELETE /agents/{id} en el backend
  // delete: (id: string) => 
  //   apiClient.delete<void>(`/agents/${id}`),

  // Gestión de bindings de herramientas
  listBindings: (id: string) => 
    apiClient.get<AgentToolBinding[]>(`/agents/${id}/bindings`),
    
  bindTool: (id: string, payload: { 
    toolId: string; 
    config?: any; 
    enabled: boolean 
  }) => apiClient.post<AgentToolBinding>(`/agents/${id}/bindings`, payload),
    
  unbindTool: (id: string, bindingId: string) => 
    apiClient.delete<void>(`/agents/${id}/bindings/${bindingId}`),
    
  // Nota: No existe PATCH /agents/{id}/bindings/{bindingId} en el backend
  // updateBinding: (id: string, bindingId: string, payload: Partial<AgentToolBinding>) =>
  //   apiClient.patch<AgentToolBinding>(`/agents/${id}/bindings/${bindingId}`, payload),
};
