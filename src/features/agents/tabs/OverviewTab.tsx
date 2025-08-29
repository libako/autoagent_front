import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SessionApi } from '../../sessions/sessionApi'
import { formatDate, formatCost } from '@/lib/utils'
import { 
  Bot, 
  MessageSquare, 
  Clock, 
  DollarSign,
  Activity,
  Settings,
  Play
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Agent, AgentToolBinding } from '@/types/domain'

interface OverviewTabProps {
  agent: Agent
  bindings: AgentToolBinding[]
}

export function OverviewTab({ agent, bindings }: OverviewTabProps) {
  // Nota: GET /sessions no está disponible en el backend actual
  // const { data: sessions = [] } = useQuery({
  //   queryKey: ['sessions', agent.id],
  //   queryFn: () => SessionApi.list(agent.id),
  // })
  
  // Usar datos simulados por ahora
  const sessions: any[] = []

  const recentSessions = sessions
    .sort((a, b) => new Date(b.startedUtc).getTime() - new Date(a.startedUtc).getTime())
    .slice(0, 5)

  const totalCost = sessions.reduce((sum, session) => sum + (session.lastEventIdx || 0) * 0.001, 0)
  const activeTools = bindings.filter(binding => binding.enabled).length

  return (
    <div className="space-y-6">
      {/* Información del agente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool Budget</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agent.toolBudget ? agent.toolBudget.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Llamadas disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Budget</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agent.tokenBudget ? agent.tokenBudget.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tools Activas</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTools}</div>
            <p className="text-xs text-muted-foreground">
              de {bindings.length} configuradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coste Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCost ? formatCost(totalCost) : '$0.0000'}
            </div>
            <p className="text-xs text-muted-foreground">
              Todas las sesiones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuración del agente */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Parámetros y configuración del agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Proveedor:</span>
                <Badge variant="outline">
                  {agent.provider === 'aifoundry' ? 'AI Foundry' : 'Local'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Autonomía:</span>
                <Badge variant={agent.autonomy === 'auto' ? 'destructive' : 'default'}>
                  {agent.autonomy}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Temperatura:</span>
                <span className="text-sm">{agent.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Top P:</span>
                <span className="text-sm">{agent.topP}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Template:</span>
                <span className="text-sm text-muted-foreground">
                  {agent.templateRef || 'Ninguno'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Creado:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(agent.createdUtc)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Actualizado:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(agent.updatedUtc)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sesiones recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sesiones Recientes</CardTitle>
              <CardDescription>
                Últimas conversaciones con este agente
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link to={`/agents/${agent.id}?tab=chat`}>
                <Play className="h-4 w-4 mr-2" />
                Nueva Sesión
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Sesión {session.id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.startedUtc)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={session.status === 'running' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/sessions/${session.id}`}>
                      Ver
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay sesiones</h3>
                <p className="text-muted-foreground mb-4">
                  Crea una nueva sesión para empezar a conversar con este agente
                </p>
                <Button asChild>
                  <Link to={`/agents/${agent.id}?tab=chat`}>
                    <Play className="h-4 w-4 mr-2" />
                    Crear Sesión
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
