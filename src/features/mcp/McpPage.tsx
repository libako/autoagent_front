import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { McpApi } from './mcpApi'
import { toast } from 'sonner'
import { 
  Server, 
  Plus, 
  Search, 
  Wrench,
  RefreshCw,
  TestTube,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react'
import type { McpServer, Tool } from '@/types/domain'

export function McpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newServer, setNewServer] = useState({
    name: '',
    baseUrl: '',
    authType: 'none' as 'none' | 'apikey' | 'oauth',
    credentials: null
  })
  const queryClient = useQueryClient()

  // Queries
  const { data: mcpServers = [], isLoading } = useQuery({
    queryKey: ['mcpServers'],
    queryFn: McpApi.listServers,
  })

  const { data: tools = [] } = useQuery({
    queryKey: ['tools', selectedServer],
    queryFn: () => selectedServer ? McpApi.listTools(selectedServer) : McpApi.listAllTools(),
    enabled: true, // Siempre habilitada
  })

  // Mutations
  const createServerMutation = useMutation({
    mutationFn: (payload: Partial<McpServer>) => McpApi.createServer(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mcpServers'] })
      toast.success('Servidor MCP creado correctamente')
      setShowCreateModal(false)
      setNewServer({ name: '', baseUrl: '', authType: 'none', credentials: null })
    },
    onError: (error) => {
      console.error('Error creating server:', error)
      toast.error('Error al crear el servidor MCP')
    },
  })

  const discoverMutation = useMutation({
    mutationFn: (serverId: string) => McpApi.discover(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      toast.success('Herramientas descubiertas correctamente')
    },
    onError: () => {
      toast.error('Error al descubrir herramientas')
    },
  })

  // Nota: testConnection y deleteServer no están disponibles en el backend actual
  // const testConnectionMutation = useMutation({
  //   mutationFn: (serverId: string) => McpApi.testConnection(serverId),
  //   onSuccess: (data) => {
  //     if (data.connected) {
  //       toast.success('Conexión exitosa')
  //     } else {
  //       toast.error(`Error de conexión: ${data.message}`)
  //     }
  //   },
  //   onError: () => {
  //     toast.error('Error al probar la conexión')
  //   },
  // })

  // const deleteServerMutation = useMutation({
  //   mutationFn: (serverId: string) => McpApi.deleteServer(serverId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['mcpServers'] })
  //     toast.success('Servidor eliminado correctamente')
  //   },
  //   onError: () => {
  //     toast.error('Error al eliminar el servidor')
  //   },
  // })

  // Filtrado
  const filteredServers = mcpServers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.baseUrl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServer = !selectedServer || tool.mcpServerId === selectedServer
    return matchesSearch && matchesServer
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default'
      case 'disconnected': return 'destructive'
      case 'connecting': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <RefreshCw className="h-4 w-4 text-yellow-600" />
    }
  }

  const handleCreateServer = () => {
    if (!newServer.name.trim() || !newServer.baseUrl.trim()) {
      toast.error('Nombre y URL son requeridos')
      return
    }
    
    const payload = {
      name: newServer.name.trim(),
      baseUrl: newServer.baseUrl.trim(),
      authType: newServer.authType
    }
    
    createServerMutation.mutate(payload)
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
          <h1 className="text-3xl font-bold">MCP Servers</h1>
          <p className="text-muted-foreground">
            Gestiona servidores MCP y descubre herramientas
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Servidor
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servidores o herramientas..."
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
        </CardContent>
      </Card>

      {/* Servidores MCP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServers.map((server) => (
          <Card key={server.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    <CardDescription>
                      {server.baseUrl}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(server.status)}
                  <Badge variant={getStatusColor(server.status)}>
                    {server.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Auth Type:</span>
                  <span>{server.authType}</span>
                </div>
                {server.lastSeenUtc && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Última vez:</span>
                    <span>{new Date(server.lastSeenUtc).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  {/* Nota: testConnection no está disponible en el backend actual */}
                  {/* <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnectionMutation.mutate(server.id)}
                    disabled={testConnectionMutation.isPending}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    Probar
                  </Button> */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => discoverMutation.mutate(server.id)}
                    disabled={discoverMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Discover
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                  {/* Nota: deleteServer no está disponible en el backend actual */}
                  {/* <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteServerMutation.mutate(server.id)}
                    disabled={deleteServerMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button> */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Herramientas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Herramientas
            {selectedServer && (
              <Badge variant="outline" className="ml-2">
                Filtrado por: {mcpServers.find(s => s.id === selectedServer)?.name || selectedServer}
              </Badge>
            )}
            {!selectedServer && (
              <Badge variant="outline" className="ml-2">
                Todas las herramientas
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {selectedServer 
              ? `Herramientas del servidor seleccionado (${filteredTools.length} encontradas)`
              : `Todas las herramientas disponibles (${filteredTools.length} encontradas)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tool.description || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Servidor: {tool.serverName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {tool.scope && (
                    <Badge variant="outline" className="text-xs">
                      {tool.scope}
                    </Badge>
                  )}
                  <Badge variant={tool.enabled ? 'default' : 'secondary'}>
                    {tool.enabled ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {filteredTools.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay herramientas</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedServer 
                    ? 'No se encontraron herramientas con los filtros aplicados'
                    : 'Configura servidores MCP y ejecuta "Discover" para encontrar herramientas'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {mcpServers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay servidores MCP</h3>
            <p className="text-muted-foreground text-center mb-4">
              Configura tu primer servidor MCP para empezar a descubrir herramientas
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Servidor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear servidor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Crear Servidor MCP</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={newServer.name}
                  onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mi Servidor MCP"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">URL Base</label>
                <Input
                  value={newServer.baseUrl}
                  onChange={(e) => setNewServer(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="http://localhost:3001"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Tipo de Autenticación</label>
                <select
                  value={newServer.authType}
                  onChange={(e) => setNewServer(prev => ({ ...prev, authType: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="none">Sin autenticación</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateServer}
                disabled={createServerMutation.isPending}
                className="flex-1"
              >
                {createServerMutation.isPending ? 'Creando...' : 'Crear Servidor'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
