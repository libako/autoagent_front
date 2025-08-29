import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AgentApi } from '../agents/agentApi'
import { SessionApi } from '../sessions/sessionApi'
import { McpApi } from '../mcp/mcpApi'
import { formatDate, formatCost } from '@/lib/utils'
import { 
  Bot, 
  Server, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  DollarSign,
  Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  // Queries para datos del dashboard
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: AgentApi.list,
  })

  // Nota: GET /sessions no está disponible en el backend actual
  // const { data: sessions = [] } = useQuery({
  //   queryKey: ['sessions'],
  //   queryFn: () => SessionApi.list(),
  // })
  
  // Usar datos simulados por ahora
  const sessions: any[] = []

  const { data: mcpServers = [] } = useQuery({
    queryKey: ['mcpServers'],
    queryFn: McpApi.listServers,
  })

  // Cálculos para métricas
  const activeAgents = agents.filter(agent => agent.provider === 'local').length
  const runningSessions = sessions.filter(session => session.status === 'running').length
  const totalCost = sessions.reduce((sum, session) => sum + (session.lastEventIdx || 0) * 0.001, 0) // Estimación
  const avgLatency = 250 // ms - placeholder

  // Sesiones recientes
  const recentSessions = sessions
    .sort((a, b) => new Date(b.startedUtc).getTime() - new Date(a.startedUtc).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de agentes, sesiones y métricas del sistema
          </p>
        </div>
        <Button asChild>
          <Link to="/agents">Crear Agente</Link>
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Activos</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningSessions}</div>
            <p className="text-xs text-muted-foreground">
              {sessions.length} totales este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coste Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latencia Media</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              Respuesta de herramientas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sesiones recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Recientes</CardTitle>
            <CardDescription>
              Últimas conversaciones con agentes
            </CardDescription>
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
                  <Badge variant={session.status === 'running' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              ))}
              {recentSessions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay sesiones recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado de MCP Servers */}
        <Card>
          <CardHeader>
            <CardTitle>MCP Servers</CardTitle>
            <CardDescription>
              Estado de los servidores de herramientas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mcpServers.map((server) => (
                <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{server.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {server.baseUrl}
                      </p>
                    </div>
                  </div>
                  <Badge variant={server.status === 'connected' ? 'default' : 'destructive'}>
                    {server.status}
                  </Badge>
                </div>
              ))}
              {mcpServers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay servidores MCP configurados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
