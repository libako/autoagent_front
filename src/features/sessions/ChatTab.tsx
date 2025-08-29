import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionApi } from './sessionApi'
import { useTraceStream } from '@/hooks/useTraceStream'
import { useTraceStore } from '@/store/traceStore'
import { TraceViewer } from './TraceViewer'
import { toast } from 'sonner'
import { 
  MessageSquare, 
  Send, 
  Play, 
  Pause,
  RotateCcw,
  Activity
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ChatMessage } from '@/types/domain'

interface ChatTabProps {
  agentId: string
}

export function ChatTab({ agentId }: ChatTabProps) {
  const [session, setSession] = useState<{ id: string; hubUrl: string; group: string } | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [processedTraceIds, setProcessedTraceIds] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Conectar al stream de trazas usando el group devuelto por la API
  useTraceStream(import.meta.env.VITE_SIGNALR_HUB_URL, session?.group ?? null)

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: () => SessionApi.create({ agentId }),
    onSuccess: (data) => {
      setSession({ id: data.id, hubUrl: data.hubUrl, group: data.group })
      setMessages([]) // Limpiar mensajes al crear nueva sesión
      setProcessedTraceIds(new Set()) // Limpiar trazas procesadas
      toast.success('Sesión creada correctamente')
    },
    onError: () => {
      toast.error('Error al crear la sesión')
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => SessionApi.sendMessage(session!.id, { content }),
    onSuccess: () => {
      setInput('')
      setIsTyping(true)
    },
    onError: () => {
      toast.error('Error al enviar el mensaje')
      setIsTyping(false)
    },
  })

  const pauseSessionMutation = useMutation({
    mutationFn: () => SessionApi.pause(session!.id),
    onSuccess: () => {
      toast.success('Sesión pausada')
    },
    onError: () => {
      toast.error('Error al pausar la sesión')
    },
  })

  const resumeSessionMutation = useMutation({
    mutationFn: () => SessionApi.resume(session!.id),
    onSuccess: () => {
      toast.success('Sesión reanudada')
    },
    onError: () => {
      toast.error('Error al reanudar la sesión')
    },
  })

  // Obtener trazas en tiempo real
  const traces = useTraceStore((state) => 
    session ? state.getSessionTraces(session.id) : []
  )

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Procesar trazas para generar mensajes
  useEffect(() => {
    if (!traces.length) return

    const newMessages: ChatMessage[] = []
    const newProcessedIds = new Set(processedTraceIds)
    
    traces.forEach((trace) => {
      if (trace.kind === 'summary') {
        const traceId = `summary-${trace.at}`
        
        // Solo procesar si no se ha procesado antes
        if (!processedTraceIds.has(traceId)) {
          const messageContent = trace.payload.content || trace.payload.summary || 'Respuesta del agente'
          
          newMessages.push({
            id: `assistant-${trace.at}`,
            role: 'assistant',
            content: messageContent,
            timestamp: trace.at,
          })
          
          newProcessedIds.add(traceId)
          setIsTyping(false)
        }
      }
    })

    if (newMessages.length > 0) {
      setMessages(prev => [...prev, ...newMessages])
      setProcessedTraceIds(newProcessedIds)
    }
  }, [traces, processedTraceIds])

  const handleSendMessage = () => {
    if (!input.trim() || !session) return

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    sendMessageMutation.mutate(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCreateSession = () => {
    createSessionMutation.mutate()
  }

  const handlePauseResume = () => {
    if (session) {
      // TODO: Implementar lógica para determinar si está pausado
      const isPaused = false
      if (isPaused) {
        resumeSessionMutation.mutate()
      } else {
        pauseSessionMutation.mutate()
      }
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Panel de chat */}
      <div className="col-span-7 flex flex-col border rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Chat con Agente</h3>
            <p className="text-sm text-muted-foreground">
              {session ? `Sesión: ${session.id.slice(0, 8)}...` : 'Sin sesión activa'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {session ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePauseResume}
                  disabled={pauseSessionMutation.isPending || resumeSessionMutation.isPending}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSession(null)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nueva Sesión
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Crear Sesión
              </Button>
            )}
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDate(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-1">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">El agente está pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje... (Ctrl+Enter para enviar)"
              className="flex-1 border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              disabled={!session || sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || !session || sendMessageMutation.isPending}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trace Viewer */}
      <div className="col-span-5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Trace en Tiempo Real
            </CardTitle>
            <CardDescription>
              Seguimiento detallado de la ejecución del agente
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)] overflow-hidden">
            {session ? (
              <TraceViewer items={traces} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sin sesión activa</h3>
                  <p className="text-muted-foreground">
                    Crea una sesión para ver las trazas en tiempo real
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
