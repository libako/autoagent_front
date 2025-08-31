import React from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  sessionId: string;
}

const statusConfig = {
  connected: {
    label: 'Conectado',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  disconnected: {
    label: 'Desconectado',
    variant: 'destructive' as const,
    icon: WifiOff,
    className: 'bg-red-100 text-red-800 border-red-200'
  },
  connecting: {
    label: 'Conectando...',
    variant: 'secondary' as const,
    icon: Wifi,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  reconnecting: {
    label: 'Reconectando...',
    variant: 'secondary' as const,
    icon: RefreshCw,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-spin'
  }
};

export function ConnectionStatus({ sessionId }: ConnectionStatusProps) {
  const { status, isConnected } = useConnectionStatus(sessionId);
  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant}
        className={`flex items-center gap-1.5 ${config.className}`}
      >
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
      
      {isConnected && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
