import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SessionApi } from './sessionApi'
import { useTraceStream } from '@/hooks/useTraceStream'
import { useTraceStore } from '@/store/traceStore'
import { TraceViewer } from './TraceViewer'
import { formatDate } from '@/lib/utils'
import { 
  MessageSquare, 
  Activity, 
  Clock, 
  Play,
  Pause,
  RotateCcw,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => SessionApi.get(sessionId!),
    enabled: !!sessionId,
  })

  // Conectar al stream de trazas: en vistas de sesión directa, el group == sessionId
  useTraceStream(import.meta.env.VITE_SIGNALR_HUB_URL, sessionId ?? null)

  // Obtener trazas en tiempo real
  const traces = useTraceStore((state) => 
    sessionId ? state.getSessionTraces(sessionId) : []
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sesión no encontrada</h3>
            <p className="text-muted-foreground">La sesión solicitada no existe o ha sido eliminada.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default'
      case 'completed': return 'default'
      case 'paused': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sesión {session.id.slice(0, 8)}...</h1>
            <p className="text-muted-foreground">
              Agente: {session.agentId} • Iniciada {formatDate(session.startedUtc)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusColor(session.status)}>
            {session.status}
          </Badge>
          {session.status === 'running' && (
            <Button size="sm" variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          {session.status === 'paused' && (
            <Button size="sm" variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Reanudar
            </Button>
          )}
          <Button size="sm" variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Nueva Sesión
          </Button>
        </div>
      </div>

      {/* Información de la sesión */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{session.status}</div>
            <p className="text-xs text-muted-foreground">
              {session.status === 'running' ? 'En ejecución' : 
               session.status === 'completed' ? 'Finalizada' :
               session.status === 'paused' ? 'Pausada' : 'Cancelada'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.lastEventIdx || 0}</div>
            <p className="text-xs text-muted-foreground">
              Eventos procesados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session.endedUtc 
                ? formatDate(session.endedUtc)
                : 'En curso'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {session.endedUtc ? 'Finalizada' : 'Iniciada'} {formatDate(session.startedUtc)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuario</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session.userId ? session.userId.slice(0, 8) + '...' : 'Anónimo'}
            </div>
            <p className="text-xs text-muted-foreground">
              ID de usuario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trace Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trace en Tiempo Real
          </CardTitle>
          <CardDescription>
            Seguimiento detallado de la ejecución de la sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] overflow-hidden">
            <TraceViewer items={traces} />
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">ID de Sesión:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {session.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">ID de Agente:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {session.agentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Iniciada:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(session.startedUtc)}
                </span>
              </div>
              {session.endedUtc && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Finalizada:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(session.endedUtc)}
                  </span>
                </div>
              )}
              {session.userId && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Usuario:</span>
                  <span className="text-sm text-muted-foreground">
                    {session.userId}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Crear Nueva Sesión
              </Button>
              <Button className="w-full" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clonar Sesión
              </Button>
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Exportar Trace
              </Button>
              <Button className="w-full" variant="destructive">
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancelar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
