// Tipos de dominio alineados con el backend

export type McpServer = {
  id: string;
  name: string;
  baseUrl: string;
  authType: "none" | "apikey" | "oauth";
  status: string;
  lastSeenUtc?: string;
  metadataJson?: any;
};

export type Tool = {
  id: string;
  mcpServerId: string;
  serverName: string;
  name: string;
  description?: string;
  inputSchemaJson: any;
  scope?: string;
  enabled: boolean;
};

export type Agent = {
  id: string;
  name: string;
  provider: "local" | "aifoundry";
  templateRef?: string | null;
  paramsJson?: any;
  autonomy: "manual" | "supervised" | "auto";
  temperature: number;
  topP: number;
  toolBudget: number;
  tokenBudget: number;
  guardrailsJson?: any;
  createdUtc: string;
  updatedUtc: string;
};

export type AgentToolBinding = {
  id: string;
  agentId: string;
  toolId: string;
  configJson?: any;
  enabled: boolean;
};

export type Session = {
  id: string;
  agentId: string;
  userId?: string;
  status: "running" | "paused" | "cancelled" | "completed";
  startedUtc: string;
  endedUtc?: string;
  lastEventIdx?: number;
};

export type TraceEvent = {
  kind: "plan" | "tool_call" | "observation" | "summary" | "error";
  payload: any;
  at: string; // ISO
  eventId?: string; // ID único del evento para deduplicación
  sessionId?: string; // ID de la sesión asociada
  idx?: number; // Índice secuencial del evento
};

export type TraceStep = {
  idx: number;
  kind: TraceEvent["kind"];
  payload: any;
  startedUtc?: string;
  endedUtc?: string;
  cost?: number;
};

export type CreateSessionResponse = {
  id: string;
  agentId: string;
  status: string;
  hubUrl: string;
  group: string;
};

// Tipos adicionales para la UI
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type AnalyticsData = {
  toolCalls: { toolName: string; count: number }[];
  latency: { toolName: string; avgLatency: number }[];
  costs: { sessionId: string; cost: number; date: string }[];
};

// Nuevos tipos para el estado de sesión y eventos de SignalR
export type SessionStatus = "connected" | "disconnected" | "connecting" | "reconnecting";

export type SignalREvent = {
  eventId: string; // ID único del evento
  sessionId: string; // ID de la sesión
  kind: TraceEvent["kind"];
  payload: any;
  at: string;
  idx?: number;
};

export type SessionStatusEvent = {
  sessionId: string;
  status: SessionStatus;
  timestamp: string;
};

export type HeartbeatEvent = {
  sessionId: string;
  timestamp: string;
  connectionId?: string;
};
