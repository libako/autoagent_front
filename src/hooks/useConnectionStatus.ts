import { useTraceStore } from '@/store/traceStore';
import { SessionStatus } from '@/types/domain';

export function useConnectionStatus(sessionId: string | null) {
  const status = useTraceStore((state) => 
    sessionId ? state.getSessionStatus(sessionId) : "disconnected"
  );
  
  const updateStatus = useTraceStore((state) => state.updateSessionStatus);
  
  const isConnected = status === "connected";
  const isConnecting = status === "connecting" || status === "reconnecting";
  const isDisconnected = status === "disconnected";
  
  const getStatusColor = (): string => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "connecting":
      case "reconnecting":
        return "text-yellow-600";
      case "disconnected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return "🟢";
      case "connecting":
        return "🟡";
      case "reconnecting":
        return "🔄";
      case "disconnected":
        return "🔴";
      default:
        return "⚪";
    }
  };
  
  return {
    status,
    isConnected,
    isConnecting,
    isDisconnected,
    getStatusColor,
    getStatusIcon,
    updateStatus: (newStatus: SessionStatus) => {
      if (sessionId) {
        updateStatus(sessionId, newStatus);
      }
    }
  };
}
