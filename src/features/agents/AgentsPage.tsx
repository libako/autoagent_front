import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AgentApi } from './agentApi'
import { formatDate } from '@/lib/utils'
import { 
  Bot, 
  Plus, 
  Search, 
  Filter,
  Settings,
  MessageSquare,
  Activity
} from 'lucide-react'

export function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProvider, setFilterProvider] = useState('')
  const [filterAutonomy, setFilterAutonomy] = useState('')

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: AgentApi.list,
  })

  // Filtrado de agentes
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = !filterProvider || agent.provider === filterProvider
    const matchesAutonomy = !filterAutonomy || agent.autonomy === filterAutonomy
    
    return matchesSearch && matchesProvider && matchesAutonomy
  })

  const getAutonomyColor = (autonomy: string) => {
    switch (autonomy) {
      case 'auto': return 'destructive'
      case 'supervised': return 'default'
      case 'manual': return 'secondary'
      default: return 'outline'
    }
  }

  const getProviderIcon = (provider: string) => {
    return provider === 'aifoundry' ? '🤖' : '⚙️'
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agentes</h1>
          <p className="text-muted-foreground">
            Gestiona tus agentes de IA y sus configuraciones
          </p>
        </div>
        <Button asChild>
          <Link to="/agents/new">
            <Plus className="h-4 w-4 mr-2" />
            Crear Agente
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar agentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Todos los proveedores</option>
              <option value="local">Local</option>
              <option value="aifoundry">AI Foundry</option>
            </select>
            
            <select
              value={filterAutonomy}
              onChange={(e) => setFilterAutonomy(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Todas las autonomías</option>
              <option value="manual">Manual</option>
              <option value="supervised">Supervisado</option>
              <option value="auto">Automático</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getProviderIcon(agent.provider)}</span>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>
                      {agent.provider === 'aifoundry' ? 'AI Foundry' : 'Local'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getAutonomyColor(agent.autonomy)}>
                  {agent.autonomy}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temperatura:</span>
                  <span>{agent.temperature}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tool Budget:</span>
                  <span>{agent.toolBudget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token Budget:</span>
                  <span>{agent.tokenBudget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creado:</span>
                  <span>{formatDate(agent.createdUtc)}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link to={`/agents/${agent.id}`}>
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link to={`/agents/${agent.id}?tab=chat`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay agentes</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterProvider || filterAutonomy 
                ? 'No se encontraron agentes con los filtros aplicados'
                : 'Crea tu primer agente para empezar'
              }
            </p>
            <Button asChild>
              <Link to="/agents/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Agente
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
