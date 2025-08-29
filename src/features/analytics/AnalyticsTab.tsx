import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SessionApi } from '../sessions/sessionApi'
import { formatCost, formatDuration } from '@/lib/utils'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Activity,
  Wrench,
  MessageSquare
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface AnalyticsTabProps {
  agentId: string
}

export function AnalyticsTab({ agentId }: AnalyticsTabProps) {
  // Nota: GET /sessions no está disponible en el backend actual
  // const { data: sessions = [] } = useQuery({
  //   queryKey: ['sessions', agentId],
  //   queryFn: () => SessionApi.list(agentId),
  // })
  
  // Usar datos simulados por ahora
  const sessions: any[] = []

  // Cálculos de métricas
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const runningSessions = sessions.filter(s => s.status === 'running').length
  const totalCost = sessions.reduce((sum, session) => sum + (session.lastEventIdx || 0) * 0.001, 0)
  const avgSessionDuration = sessions.length > 0 
    ? sessions.reduce((sum, session) => {
        const start = new Date(session.startedUtc).getTime()
        const end = session.endedUtc ? new Date(session.endedUtc).getTime() : Date.now()
        return sum + (end - start)
      }, 0) / sessions.length
    : 0

  // Datos para gráficos
  const sessionsByStatus = [
    { name: 'Completadas', value: completedSessions, color: '#10b981' },
    { name: 'En ejecución', value: runningSessions, color: '#3b82f6' },
    { name: 'Pausadas', value: sessions.filter(s => s.status === 'paused').length, color: '#f59e0b' },
    { name: 'Canceladas', value: sessions.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
  ]

  const sessionsByDay = sessions.reduce((acc, session) => {
    const date = new Date(session.startedUtc).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sessionsChartData = Object.entries(sessionsByDay).map(([date, count]) => ({
    date,
    sessions: count
  }))

  const costByDay = sessions.reduce((acc, session) => {
    const date = new Date(session.startedUtc).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })
    const cost = (session.lastEventIdx || 0) * 0.001
    acc[date] = (acc[date] || 0) + cost
    return acc
  }, {} as Record<string, number>)

  const costChartData = Object.entries(costByDay).map(([date, cost]) => ({
    date,
    cost: parseFloat(cost.toFixed(4))
  }))

  // Datos simulados para tool calls (en un caso real vendrían del backend)
  const toolCallsData = [
    { name: 'Web Search', calls: 45, avgLatency: 1200 },
    { name: 'File Reader', calls: 32, avgLatency: 800 },
    { name: 'Calculator', calls: 28, avgLatency: 150 },
    { name: 'Database', calls: 15, avgLatency: 2500 },
  ]

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {completedSessions} completadas
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
              En ejecución actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Media</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Por sesión
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
              Todas las sesiones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de sesiones por día */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones por Día</CardTitle>
            <CardDescription>
              Número de sesiones iniciadas por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de costes por día */}
        <Card>
          <CardHeader>
            <CardTitle>Costes por Día</CardTitle>
            <CardDescription>
              Coste acumulado por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCost(value as number), 'Coste']} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estado de sesiones y Tool Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de sesiones */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Sesiones</CardTitle>
            <CardDescription>
              Distribución por estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sessionsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Calls */}
        <Card>
          <CardHeader>
            <CardTitle>Llamadas a Herramientas</CardTitle>
            <CardDescription>
              Uso y latencia de herramientas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolCallsData.map((tool) => (
                <div key={tool.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tool.calls} llamadas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tool.avgLatency}ms</p>
                    <p className="text-xs text-muted-foreground">latencia media</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de sesiones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones Recientes</CardTitle>
          <CardDescription>
            Últimas 10 sesiones con este agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Sesión {session.id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.startedUtc).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {session.lastEventIdx || 0} eventos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
