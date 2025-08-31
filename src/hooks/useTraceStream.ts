import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useTraceStore } from "@/store/traceStore";
import { toast } from "sonner";
import type { SignalREvent, SessionStatusEvent, HeartbeatEvent } from "@/types/domain";
import { SIGNALR_CONFIG, NOTIFICATION_CONFIG } from "@/lib/signalRConfig";

export function useTraceStream(hubUrl: string | null | undefined, groupId: string | null) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const append = useTraceStore((state) => state.append);
  const clear = useTraceStore((state) => state.clear);
  const updateSessionStatus = useTraceStore((state) => state.updateSessionStatus);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Habilitar SignalR solo si está configurado en el backend
    const enableSignalR = import.meta.env.VITE_ENABLE_SIGNALR === 'true';
    
    if (!enableSignalR) {
      console.log('SignalR deshabilitado - configurar VITE_ENABLE_SIGNALR=true para habilitar');
      return;
    }
    
    // Log para debugging
    console.log('Intentando conectar a SignalR:', hubUrl, 'group:', groupId);
    
    if (!hubUrl || !groupId) {
      // Limpiar trazas si no hay sesión
      if (groupId) {
        clear(groupId);
        updateSessionStatus(groupId, "disconnected");
      }
      return;
    }

    // Evitar múltiples conexiones
    if (connectionRef.current) {
      console.log('Ya hay una conexión activa, cerrando...');
      connectionRef.current.stop();
    }

    // Limpiar intervalo de heartbeat anterior
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { withCredentials: true })
      .withAutomaticReconnect(SIGNALR_CONFIG.RECONNECTION.DELAYS)
      .build();

    connectionRef.current = conn;

    // Manejador para eventos de trazabilidad con ID único
    const onTrace = (evt: any) => {
      console.log('📡 Evento de trazabilidad recibido:', evt);
      
      // Mapear la estructura del backend al formato esperado por el frontend
      const mappedEvent = {
        eventId: evt.id, // El backend usa 'id', no 'eventId'
        sessionId: groupId, // Usar el groupId actual
        kind: evt.kind,
        payload: evt.payload,
        at: evt.at,
        idx: evt.idx
      };
      
      console.log('🔄 Evento mapeado:', mappedEvent);
      
      // Append al store con throttling para evitar re-renders excesivos
      requestAnimationFrame(() => {
        console.log('💾 Guardando evento en store...');
        append(mappedEvent);
        console.log('✅ Evento guardado en store');
      });
    };

    // Manejador para eventos de estado de sesión
    const onSessionStatus = (evt: SessionStatusEvent) => {
      if (evt.sessionId !== groupId) {
        return;
      }
      
      console.log('🔌 Estado de sesión actualizado:', evt.status);
      updateSessionStatus(evt.sessionId, evt.status);
      
      // Mostrar notificaciones para cambios de estado importantes
      if (evt.status === "connected") {
        toast.success(NOTIFICATION_CONFIG.SUCCESS.CONNECTED);
      } else if (evt.status === "disconnected") {
        toast.warning(NOTIFICATION_CONFIG.WARNING.DISCONNECTED);
      } else if (evt.status === "reconnecting") {
        toast.info(NOTIFICATION_CONFIG.WARNING.RECONNECTING);
      }
    };

    // Manejador para eventos de heartbeat
    const onHeartbeat = (evt: HeartbeatEvent) => {
      if (evt.sessionId !== groupId) {
        return;
      }
      
      console.log('💓 Heartbeat recibido:', evt.timestamp);
      // El heartbeat confirma que la conexión está activa
      updateSessionStatus(evt.sessionId, "connected");
    };

    const onError = (error: Error) => {
      console.error("Error en SignalR:", error);
      toast.error(NOTIFICATION_CONFIG.ERROR.SIGNALR_ERROR);
      if (groupId) {
        updateSessionStatus(groupId, "disconnected");
      }
    };

    const onReconnecting = () => {
      console.log("Reconectando a SignalR...");
      toast.info(NOTIFICATION_CONFIG.INFO.RECONNECTING);
      if (groupId) {
        updateSessionStatus(groupId, "reconnecting");
      }
    };

    const onReconnected = () => {
      console.log("Reconectado a SignalR");
      toast.success(NOTIFICATION_CONFIG.SUCCESS.RECONNECTED);
      if (groupId) {
        updateSessionStatus(groupId, "connected");
      }
    };

    let mounted = true;

    const startConnection = async () => {
      try {
        await conn.start();
        console.log("Conectado a SignalR hub:", hubUrl);
        
        // Unirse al grupo de la sesión
        await conn.invoke(SIGNALR_CONFIG.METHODS.JOIN_GROUP, groupId);
        
        // Suscribirse a los nuevos eventos
        conn.on(SIGNALR_CONFIG.EVENTS.TRACE, onTrace);
        conn.on(SIGNALR_CONFIG.EVENTS.SESSION_STATUS, onSessionStatus);
        conn.on(SIGNALR_CONFIG.EVENTS.HEARTBEAT, onHeartbeat);
        
        // Eventos de conexión
        conn.onclose((error) => onError(error || new Error('Conexión cerrada')));
        conn.onreconnecting(onReconnecting);
        conn.onreconnected(onReconnected);
        
        // Actualizar estado de sesión
        updateSessionStatus(groupId, "connected");
        
        // Configurar heartbeat automático
        heartbeatIntervalRef.current = setInterval(async () => {
          try {
            if (conn.state === signalR.HubConnectionState.Connected) {
              await conn.invoke(SIGNALR_CONFIG.METHODS.SEND_HEARTBEAT, groupId);
            }
          } catch (error) {
            console.warn("Error enviando heartbeat:", error);
          }
        }, SIGNALR_CONFIG.HEARTBEAT.INTERVAL);
        
        console.log('🎧 Suscrito a eventos SignalR. Esperando eventos "trace", "sessionStatus" y "heartbeat"...');
        
      } catch (error) {
        console.error("Error al conectar SignalR:", error);
        toast.error(NOTIFICATION_CONFIG.ERROR.CONNECTION_FAILED);
        if (groupId) {
          updateSessionStatus(groupId, "disconnected");
        }
      }
    };

    startConnection();

    return () => {
      mounted = false;
      
      // Limpiar intervalo de heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      if (conn) {
        conn.off(SIGNALR_CONFIG.EVENTS.TRACE, onTrace);
        conn.off(SIGNALR_CONFIG.EVENTS.SESSION_STATUS, onSessionStatus);
        conn.off(SIGNALR_CONFIG.EVENTS.HEARTBEAT, onHeartbeat);
        conn.stop();
      }
      
      // Actualizar estado de sesión
      if (groupId) {
        updateSessionStatus(groupId, "disconnected");
      }
    };
  }, [hubUrl, groupId, append, clear, updateSessionStatus]);

  // Función para enviar mensajes al hub
  const sendMessage = async (message: string) => {
    if (!connectionRef.current || !groupId) return;
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.METHODS.SEND_MESSAGE, groupId, message);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error(NOTIFICATION_CONFIG.ERROR.MESSAGE_SEND_FAILED);
    }
  };

  // Función para enviar heartbeat manual
  const sendHeartbeat = async () => {
    if (!connectionRef.current || !groupId) return;
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.METHODS.SEND_HEARTBEAT, groupId);
    } catch (error) {
      console.error("Error enviando heartbeat:", error);
    }
  };

  return { sendMessage, sendHeartbeat };
}
