import { apiClient } from "@/lib/apiClient";
import type { McpServer, Tool } from "@/types/domain";

export const McpApi = {
  // Servidores MCP
  listServers: () => apiClient.get<McpServer[]>("/mcp/servers"),
  
  createServer: (payload: Partial<McpServer>) => 
    apiClient.post<McpServer>("/mcp/servers", payload),
    
  // Nota: No existe GET /mcp/servers/{id} en el backend
  // getServer: (id: string) => apiClient.get<McpServer>(`/mcp/servers/${id}`),
  
  // Nota: No existe PATCH /mcp/servers/{id} en el backend
  // updateServer: (id: string, payload: Partial<McpServer>) => 
  //   apiClient.patch<McpServer>(`/mcp/servers/${id}`, payload),
    
  // Nota: No existe DELETE /mcp/servers/{id} en el backend
  // deleteServer: (id: string) => apiClient.delete<void>(`/mcp/servers/${id}`),
    
  discover: (id: string) => 
    apiClient.post<void>(`/mcp/servers/${id}/discover`),
    
  // Nota: No existe POST /mcp/servers/{id}/test en el backend
  // testConnection: (id: string) => 
  //   apiClient.post<void>(`/mcp/servers/${id}/test`),

  // Herramientas
  listTools: (serverId?: string) => {
    // Validar que serverId sea un string válido
    if (serverId && typeof serverId !== 'string') {
      console.warn('listTools: serverId debe ser un string, recibido:', typeof serverId, serverId);
      return apiClient.get<Tool[]>('/mcp/tools');
    }
    
    // Según el Swagger, el parámetro se llama 'serverld' (con 'l' minúscula)
    const params = serverId && serverId.trim() ? `?serverld=${encodeURIComponent(serverId.trim())}` : '';
    return apiClient.get<Tool[]>(`/mcp/tools${params}`);
  },

  // Nuevo endpoint para obtener todas las tools sin filtro
  listAllTools: () => apiClient.get<Tool[]>('/mcp/tools/all'),
  
  // Nota: No existe GET /mcp/tools/{id} en el backend
  // getTool: (id: string) => apiClient.get<Tool>(`/mcp/tools/${id}`),
  
  // Nota: No existe PATCH /mcp/tools/{id} en el backend
  // updateTool: (id: string, payload: Partial<Tool>) => 
  //   apiClient.patch<Tool>(`/mcp/tools/${id}`, payload),
    
  // Nota: No existe POST /mcp/tools/{id}/enable en el backend
  // enableTool: (id: string) => apiClient.post<void>(`/mcp/tools/${id}/enable`),
    
  // Nota: No existe POST /mcp/tools/refresh en el backend
  // refreshTools: () => apiClient.post<void>("/mcp/tools/refresh"),
};
