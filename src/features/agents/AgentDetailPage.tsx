import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AgentApi } from './agentApi'
import { formatDate } from '@/lib/utils'
import { 
  Bot, 
  Settings, 
  MessageSquare, 
  BarChart3,
  Wrench,
  Shield,
  Play,
  Save
} from 'lucide-react'
import { OverviewTab } from './tabs/OverviewTab'
import { ToolsTab } from './tabs/ToolsTab'
import { PolicyTab } from './tabs/PolicyTab'
import { ChatTab } from '../sessions/ChatTab'
import { AnalyticsTab } from '../analytics/AnalyticsTab'

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => AgentApi.get(agentId!),
    enabled: !!agentId,
  })

  const { data: bindings = [] } = useQuery({
    queryKey: ['bindings', agentId],
    queryFn: () => AgentApi.listBindings(agentId!),
    enabled: !!agentId,
  })

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

  if (!agent) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Agente no encontrado</h3>
            <p className="text-muted-foreground">El agente solicitado no existe o ha sido eliminado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const getAutonomyColor = (autonomy: string) => {
    switch (autonomy) {
      case 'auto': return 'destructive'
      case 'supervised': return 'default'
      case 'manual': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <p className="text-muted-foreground">
                {agent.provider === 'aifoundry' ? 'AI Foundry' : 'Local'} • 
                Creado {formatDate(agent.createdUtc)}
              </p>
            </div>
          </div>
          <Badge variant={getAutonomyColor(agent.autonomy)}>
            {agent.autonomy}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Crear Sesión
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Policy
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab agent={agent} bindings={bindings} />
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <ToolsTab agent={agent} bindings={bindings} />
        </TabsContent>

        <TabsContent value="policy" className="mt-6">
          <PolicyTab agent={agent} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ChatTab agentId={agent.id} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
