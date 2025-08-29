import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useTraceStore } from "@/store/traceStore";
import { toast } from "sonner";

export function useTraceStream(hubUrl: string | null | undefined, groupId: string | null) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const append = useTraceStore((state) => state.append);
  const clear = useTraceStore((state) => state.clear);

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
      }
      return;
    }

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { withCredentials: true })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Estrategia de reconexión
      .build();

    connectionRef.current = conn;

    const onTrace = (evt: { 
      sessionId?: string; 
      kind: string; 
      payload: any; 
      at: string;
      idx?: number;
    }) => {
      // Si el backend envía sessionId, filtramos; si no, aceptamos por pertenecer al grupo
      if (evt.sessionId && evt.sessionId !== groupId) {
        return;
      }
      
      // Append al store con throttling para evitar re-renders excesivos
      requestAnimationFrame(() => {
        append({
          sessionId: evt.sessionId ?? groupId,
          kind: evt.kind as any,
          payload: evt.payload,
          at: evt.at,
          idx: evt.idx,
        });
      });
    };

    const onError = (error: Error) => {
      console.error("Error en SignalR:", error);
      toast.error("Error de conexión con el servidor");
    };

    const onReconnecting = () => {
      console.log("Reconectando a SignalR...");
      toast.info("Reconectando...");
    };

    const onReconnected = () => {
      console.log("Reconectado a SignalR");
      toast.success("Reconectado");
    };

    let mounted = true;

    const startConnection = async () => {
      try {
        await conn.start();
        console.log("Conectado a SignalR hub:", hubUrl);
        
        // Unirse al grupo de la sesión
        await conn.invoke("JoinGroup", groupId);
        
        // Suscribirse a eventos
        conn.on("trace", onTrace);
        conn.onclose(onError);
        conn.onreconnecting(onReconnecting);
        conn.onreconnected(onReconnected);
        
        console.log('🎧 Suscrito a eventos SignalR. Esperando eventos "trace"...');
        
      } catch (error) {
        console.error("Error al conectar SignalR:", error);
        toast.error("Error al conectar con el servidor");
      }
    };

    startConnection();

    return () => {
      mounted = false;
      if (conn) {
        conn.off("trace", onTrace);
        conn.offclose(onError);
        conn.offreconnecting(onReconnecting);
        conn.offreconnected(onReconnected);
        conn.stop();
      }
    };
  }, [hubUrl, groupId, append, clear]);

  // Función para enviar mensajes al hub
  const sendMessage = async (message: string) => {
    if (!connectionRef.current || !groupId) return;
    
    try {
      await connectionRef.current.invoke("SendMessage", groupId, message);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error("Error enviando mensaje");
    }
  };

  return { sendMessage };
}
