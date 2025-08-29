// Cliente API centralizado con interceptores y manejo de autenticación

export async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  
  // Dev: API key opcional
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    headers.set("x-api-key", apiKey);
  }
  
  // Prod: Bearer token (MSAL)
  // TODO: Implementar MSAL para producción
  // const token = await msalInstance.acquireTokenSilent({ scopes: ["api://..."] });
  // if (token) {
  //   headers.set("Authorization", `Bearer ${token.accessToken}`);
  // }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const fullUrl = `${baseUrl}${url}`;
  
  // Log solo en desarrollo
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      method: init.method || 'GET',
      url: fullUrl,
      body: init.body,
      headers: Object.fromEntries(headers.entries())
    });
  }
  
  try {
    const res = await fetch(fullUrl, { 
      ...init, 
      headers,
      signal: AbortSignal.timeout(30000) // 30s timeout
    });
    
    // Log solo en desarrollo
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', errorText);
      throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }
    
    const data = await res.json();
    // Log solo en desarrollo
    if (import.meta.env.DEV) {
      console.log('API Success Response:', data);
    }
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      // Manejo específico de errores de autenticación
      if (error.message.includes('401')) {
        // TODO: Redirigir a login
        console.error('Error de autenticación:', error);
      }
      if (error.message.includes('403')) {
        console.error('Error de autorización:', error);
      }
    }
    throw error;
  }
}

// Funciones helper para métodos HTTP comunes
export const apiClient = {
  get: <T>(url: string) => api<T>(url),
  
  post: <T>(url: string, data?: any) => 
    api<T>(url, { 
      method: "POST", 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  patch: <T>(url: string, data: any) => 
    api<T>(url, { 
      method: "PATCH", 
      body: JSON.stringify(data) 
    }),
    
  delete: <T>(url: string) => 
    api<T>(url, { method: "DELETE" }),
    
  put: <T>(url: string, data: any) => 
    api<T>(url, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
};
