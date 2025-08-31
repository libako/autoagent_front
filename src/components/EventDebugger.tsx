import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTraceStore } from '@/store/traceStore';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Bug, Eye, EyeOff, RefreshCw, Activity } from 'lucide-react';

interface EventDebuggerProps {
  sessionId: string;
}

export function EventDebugger({ sessionId }: EventDebuggerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showEventIds, setShowEventIds] = useState(true);
  
  const traces = useTraceStore((state) => state.getSessionTraces(sessionId));
  const { status, isConnected, getStatusIcon } = useConnectionStatus(sessionId);
  
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleEventIds = () => setShowEventIds(!showEventIds);
  
  const eventCounts = traces.reduce((acc, trace) => {
    acc[trace.kind] = (acc[trace.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueEventIds = new Set(traces.map(t => t.eventId).filter(Boolean)).size;
  const totalEvents = traces.length;
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleVisibility}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug SignalR
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEventIds}
                className="h-6 w-6 p-0"
              >
                {showEventIds ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVisibility}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Sesión: {sessionId.slice(0, 8)}... • Estado: {getStatusIcon()} {status}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted p-2 rounded">
              <div className="font-semibold">Total Eventos</div>
              <div className="text-2xl font-bold">{totalEvents}</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-semibold">IDs Únicos</div>
              <div className="text-2xl font-bold">{uniqueEventIds}</div>
            </div>
          </div>
          
          {/* Contadores por tipo */}
          <div className="space-y-2">
            <div className="text-xs font-semibold">Eventos por Tipo:</div>
            {Object.entries(eventCounts).map(([kind, count]) => (
              <div key={kind} className="flex items-center justify-between text-xs">
                <Badge variant="outline" className="text-xs">
                  {kind}
                </Badge>
                <span className="font-mono">{count}</span>
              </div>
            ))}
          </div>
          
          {/* Últimos eventos */}
          <div className="space-y-2">
            <div className="text-xs font-semibold">Últimos 5 Eventos:</div>
            {traces.slice(-5).reverse().map((trace, index) => (
              <div key={index} className="text-xs bg-muted p-2 rounded">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {trace.kind}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(trace.at).toLocaleTimeString()}
                  </span>
                </div>
                {showEventIds && trace.eventId && (
                  <div className="font-mono text-xs text-muted-foreground">
                    ID: {trace.eventId.slice(0, 12)}...
                  </div>
                )}
                {trace.idx !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Índice: #{trace.idx}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
