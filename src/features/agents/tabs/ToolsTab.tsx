import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AgentApi } from '../agentApi'
import { McpApi } from '../../mcp/mcpApi'
import { toast } from 'sonner'
import { 
  Wrench, 
  Search, 
  Server, 
  Settings,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import type { Agent, AgentToolBinding, Tool, McpServer } from '@/types/domain'

interface ToolsTabProps {
  agent: Agent
  bindings: AgentToolBinding[]
}

export function ToolsTab({ agent, bindings }: ToolsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServer, setSelectedServer] = useState<string>('')
  const queryClient = useQueryClient()

  // Queries
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: McpApi.listAllTools,
  })

  const { data: mcpServers = [] } = useQuery({
    queryKey: ['mcpServers'],
    queryFn: McpApi.listServers,
  })

  // Mutations
  const bindToolMutation = useMutation({
    mutationFn: ({ toolId, config }: { toolId: string; config?: any }) =>
      AgentApi.bindTool(agent.id, { toolId, config, enabled: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bindings', agent.id] })
      toast.success('Herramienta vinculada correctamente')
    },
    onError: () => {
      toast.error('Error al vincular la herramienta')
    },
  })

  const unbindToolMutation = useMutation({
    mutationFn: (bindingId: string) => AgentApi.unbindTool(agent.id, bindingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bindings', agent.id] })
      toast.success('Herramienta desvinculada correctamente')
    },
    onError: () => {
      toast.error('Error al desvincular la herramienta')
    },
  })

  // Nota: updateBinding no está disponible en el backend actual
  // const toggleBindingMutation = useMutation({
  //   mutationFn: ({ bindingId, enabled }: { bindingId: string; enabled: boolean }) =>
  //     AgentApi.updateBinding(agent.id, bindingId, { enabled }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['bindings', agent.id] })
  //     toast.success('Estado de herramienta actualizado')
  //   },
  //   onError: () => {
  //     toast.error('Error al actualizar el estado de la herramienta')
  //   },
  // })

  // Filtrado de herramientas disponibles
  const availableTools = tools.filter(tool => {
    const isBound = bindings.some(binding => binding.toolId === tool.id)
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServer = !selectedServer || tool.mcpServerId === selectedServer
    
    return !isBound && matchesSearch && matchesServer
  })

  // Agrupar herramientas por servidor
  const toolsByServer = availableTools.reduce((acc, tool) => {
    const server = mcpServers.find(s => s.id === tool.mcpServerId)
    const serverName = server?.name || 'Unknown Server'
    
    if (!acc[serverName]) {
      acc[serverName] = []
    }
    acc[serverName].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  const handleBindTool = (tool: Tool) => {
    bindToolMutation.mutate({ toolId: tool.id })
  }

  const handleUnbindTool = (bindingId: string) => {
    unbindToolMutation.mutate(bindingId)
  }

  // Nota: updateBinding no está disponible en el backend actual
  // const handleToggleBinding = (bindingId: string, enabled: boolean) => {
  //   toggleBindingMutation.mutate({ bindingId, enabled })
  // }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Panel izquierdo - Herramientas disponibles */}
      <div className="col-span-7">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Herramientas Disponibles
            </CardTitle>
            <CardDescription>
              Arrastra herramientas al panel derecho para vincularlas al agente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar herramientas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos los servidores</option>
                {mcpServers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de herramientas */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(toolsByServer).map(([serverName, serverTools]) => (
                <div key={serverName} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Server className="h-4 w-4" />
                    {serverName}
                  </div>
                  {serverTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleBindTool(tool)}
                    >
                      <div className="flex items-center space-x-3">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{tool.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tool.description || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tool.scope && (
                          <Badge variant="outline" className="text-xs">
                            {tool.scope}
                          </Badge>
                        )}
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {availableTools.length === 0 && (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay herramientas disponibles</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedServer 
                      ? 'No se encontraron herramientas con los filtros aplicados'
                      : 'Configura servidores MCP para descubrir herramientas'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel derecho - Toolbox del agente */}
      <div className="col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Toolbox del Agente
            </CardTitle>
            <CardDescription>
              Herramientas vinculadas a este agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bindings.map((binding) => {
                const tool = tools.find(t => t.id === binding.toolId)
                const server = mcpServers.find(s => s.id === tool?.mcpServerId)
                
                if (!tool) return null

                return (
                  <div key={binding.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{tool.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {server?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Nota: updateBinding no está disponible en el backend actual */}
                        {/* <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleBinding(binding.id, !binding.enabled)}
                        >
                          {binding.enabled ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button> */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnbindTool(binding.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    {tool.scope && (
                      <Badge variant="outline" className="text-xs">
                        {tool.scope}
                      </Badge>
                    )}
                    
                    {binding.configJson && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <p className="font-medium">Configuración:</p>
                        <pre className="text-muted-foreground">
                          {JSON.stringify(binding.configJson, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
              
              {bindings.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay herramientas vinculadas</h3>
                  <p className="text-muted-foreground">
                    Arrastra herramientas desde el panel izquierdo para vincularlas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
