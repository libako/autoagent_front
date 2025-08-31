// Configuración para las nuevas funcionalidades de SignalR

export const SIGNALR_CONFIG = {
  // Eventos disponibles
  EVENTS: {
    TRACE: 'trace',
    SESSION_STATUS: 'sessionStatus',
    HEARTBEAT: 'heartbeat'
  },
  
  // Métodos del servidor
  METHODS: {
    JOIN_GROUP: 'JoinGroup',
    SEND_MESSAGE: 'SendMessage',
    SEND_HEARTBEAT: 'SendHeartbeat'
  },
  
  // Configuración de heartbeat
  HEARTBEAT: {
    INTERVAL: 30000, // 30 segundos
    TIMEOUT: 10000,  // 10 segundos
    MAX_RETRIES: 3
  },
  
  // Configuración de reconexión
  RECONNECTION: {
    DELAYS: [0, 2000, 10000, 30000] as number[], // Delays en milisegundos
    MAX_ATTEMPTS: 5
  },
  
  // Estados de conexión
  CONNECTION_STATES: {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting'
  }
} as const;

// Tipos de eventos de debug
export const DEBUG_EVENTS = {
  TRACE_RECEIVED: '📡 Evento de trazabilidad recibido',
  SESSION_STATUS_UPDATED: '🔌 Estado de sesión actualizado',
  HEARTBEAT_RECEIVED: '💓 Heartbeat recibido',
  CONNECTION_ESTABLISHED: '✅ Conexión establecida',
  CONNECTION_LOST: '❌ Conexión perdida',
  RECONNECTION_ATTEMPT: '🔄 Intento de reconexión',
  DUPLICATE_DETECTED: '⚠️ Evento duplicado detectado'
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  SUCCESS: {
    CONNECTED: 'Sesión conectada',
    RECONNECTED: 'Reconectado',
    HEARTBEAT_SENT: 'Heartbeat enviado'
  },
  WARNING: {
    DISCONNECTED: 'Sesión desconectada',
    RECONNECTING: 'Reconectando sesión...',
    HEARTBEAT_FAILED: 'Error en heartbeat'
  },
  ERROR: {
    CONNECTION_FAILED: 'Error al conectar con el servidor',
    MESSAGE_SEND_FAILED: 'Error enviando mensaje',
    SIGNALR_ERROR: 'Error de conexión con el servidor'
  },
  INFO: {
    RECONNECTING: 'Reconectando...',
    JOINING_GROUP: 'Uniéndose al grupo de sesión'
  }
} as const;
