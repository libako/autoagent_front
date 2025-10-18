import { useState, useCallback, useRef, useEffect } from 'react'
import { useAutoScroll, useAutoScrollEffect } from '@/hooks/useAutoScroll'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionApi } from './sessionApi'
import { useTraceStream } from '@/hooks/useTraceStream'
import { useTraceStore } from '@/store/traceStore'
import { TraceViewer } from './TraceViewer'
import { toast } from 'sonner'
import { 
  Send, 
  Play, 
  Pause,
  RotateCcw,
  Activity
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ChatMessage } from '@/types/domain'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface ChatTabProps {
  agentId: string
}

// Función para desenvolver fence global de markdown
function unwrapTopLevelMarkdownFence(s: string): string {
  console.log('🔍 unwrapTopLevelMarkdownFence - Input:', s.substring(0, 100) + '...');
  
  // Solo remover si el contenido está COMPLETAMENTE envuelto en un fence markdown
  const trimmed = s.trim();
  const markdownFenceRegex = /^```markdown\s*([\s\S]*?)\s*```$/;
  const genericFenceRegex = /^```\s*([\s\S]*?)\s*```$/;
  
  // Primero intentar con fence específico de markdown
  let match = trimmed.match(markdownFenceRegex);
  if (match) {
    console.log('✅ Fence markdown detectado y removido');
    return match[1];
  }
  
  // Si no, intentar con fence genérico solo si el contenido parece ser markdown
  match = trimmed.match(genericFenceRegex);
  if (match) {
    const content = match[1];
    // Solo remover si el contenido parece ser markdown (empieza con # o tiene elementos markdown)
    if (content.trim().startsWith('#') || content.includes('##') || content.includes('**') || content.includes('*')) {
      console.log('✅ Fence genérico con contenido markdown detectado y removido');
      return content;
    }
  }
  
  console.log('❌ No se detectó fence global, devolviendo original');
  return s;
}

// Función para extraer contenido de JSON
function extractContentFromJson(content: string): string {
  console.log('🔍 extractContentFromJson - Input completo:', content);
  try {
    const parsed = JSON.parse(content);
    console.log('📦 JSON parseado:', parsed);
    if (parsed && typeof parsed === 'object' && parsed.content) {
      console.log('✅ Contenido extraído del JSON:', parsed.content);
      return parsed.content;
    } else {
      console.log('⚠️ JSON válido pero sin propiedad content');
    }
  } catch (error) {
    console.log('❌ No es JSON válido, error:', error);
  }
  console.log('🔄 Devolviendo contenido original');
  return content;
}

// Función para normalizar contenido
function normalizeContent(content: string): string {
  console.log('🚨 normalizeContent - Input:', content.substring(0, 100) + '...');
  
  // Primero extraer contenido del JSON si es necesario
  const extractedContent = extractContentFromJson(content);
  
  // Quitar BOM y normalizar saltos de línea
  const normalized = String(extractedContent).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  // Desenvolver fence global si existe
  const result = unwrapTopLevelMarkdownFence(normalized);
  console.log('📝 normalizeContent - Output:', result.substring(0, 100) + '...');
  return result;
}

export function ChatTab({ agentId }: ChatTabProps) {
  const [session, setSession] = useState<{ id: string; hubUrl: string; group: string } | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useAutoScroll<HTMLDivElement>({ 
    behavior: 'smooth', 
    delay: 100,
    enabled: true 
  })

  // Conectar al stream de trazas usando el group devuelto por la API
  useTraceStream(import.meta.env.VITE_SIGNALR_HUB_URL, session?.group ?? null)

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: () => SessionApi.create({ agentId }),
    onSuccess: (data) => {
      setSession({ id: data.id, hubUrl: data.hubUrl, group: data.group })
      setMessages([]) // Limpiar mensajes al crear nueva sesión

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
    session ? state.getSessionTraces(session.group) : []
  )

  // Auto-scroll al final de los mensajes
  useAutoScrollEffect(messagesEndRef, [messages], { 
    behavior: 'smooth', 
    delay: 50 
  })

  // Scroll adicional cuando cambia la cantidad de mensajes
  useAutoScrollEffect(messagesEndRef, [messages.length], { 
    behavior: 'smooth', 
    delay: 100 
  })

  // Scroll adicional cuando cambia el estado de typing
  useAutoScrollEffect(messagesEndRef, [isTyping], { 
    behavior: 'smooth', 
    delay: 200 
  })

  // Ref para rastrear eventos ya procesados
  const processedEventIds = useRef<Set<string>>(new Set())
  
  // Procesar trazas para generar mensajes usando useCallback para estabilidad
  const processTraces = useCallback((newTraces: any[]) => {
    if (!newTraces.length) return

    console.log('🔄 Procesando trazas:', newTraces.length)
    
    const newMessages: ChatMessage[] = []
    
    newTraces.forEach((trace) => {
      if (trace.kind === 'summary') {
        // Usar eventId para deduplicación
        const eventId = trace.eventId || trace.id
        
        if (processedEventIds.current.has(eventId)) {
          console.log('⚠️ Evento ya procesado, ignorando:', eventId)
          return
        }
        
        const messageContent = trace.payload.content || trace.payload.summary || 'Respuesta del agente'
        
        // Verificar si ya existe un mensaje con el mismo contenido (doble verificación)
        const existingMessage = messages.find(msg => 
          msg.role === 'assistant' && 
          msg.content === messageContent
        )
        
        if (!existingMessage) {
          console.log('✅ Nuevo mensaje agregado para evento:', eventId)
          newMessages.push({
            id: `assistant-${eventId}`,
            role: 'assistant',
            content: messageContent,
            timestamp: trace.at,
          })
          
          // Marcar como procesado
          processedEventIds.current.add(eventId)
          setIsTyping(false)
        } else {
          console.log('⚠️ Mensaje duplicado detectado, ignorando')
        }
      }
    })

    if (newMessages.length > 0) {
      console.log('📨 Agregando', newMessages.length, 'nuevos mensajes')
      setMessages(prev => [...prev, ...newMessages])
    }
  }, [messages])

  // useEffect que solo se ejecuta cuando cambian las trazas
  useEffect(() => {
    processTraces(traces)
  }, [traces, processTraces])

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

    // El scroll automático se maneja con el hook useAutoScroll

    sendMessageMutation.mutate(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  const handleCreateSession = () => {
    // Limpiar eventos procesados para nueva sesión
    processedEventIds.current.clear()
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
                  onClick={() => {
                    processedEventIds.current.clear()
                    setSession(null)
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nueva Sesión
                </Button>
              </>
            ) : (
                                <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateSession}
                      disabled={createSessionMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Crear Sesión
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Agregar un mensaje de prueba del agente
                        const testMessage: ChatMessage = {
                          id: `test-${Date.now()}`,
                          role: 'assistant',
                          content: JSON.stringify({
                            content: "# Título de Prueba\n\n## Subtítulo\n\nEste es un **párrafo** con *formato*.\n\n### Lista:\n- Elemento 1\n- Elemento 2\n- Elemento 3\n\n### Código:\n```python\ndef hola():\n    print('Hola Mundo')\n```\n\n### Tabla:\n| Col1 | Col2 |\n|------|------|\n| A    | B    |"
                          }),
                          timestamp: new Date().toISOString(),
                        }
                        setMessages(prev => [...prev, testMessage])
                      }}
                    >
                      🧪 Probar Markdown (JSON)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Agregar un mensaje de prueba del agente con markdown completo
                        const testMessage: ChatMessage = {
                          id: `test-complete-${Date.now()}`,
                          role: 'assistant',
                          content: "# Título Principal\n\n## Subtítulo\n\nEste es un **párrafo** con *formato* y `código inline`.\n\n### Lista Desordenada\n- Elemento 1\n- Elemento 2\n- Elemento 3\n\n### Lista Ordenada\n1. Primer elemento\n2. Segundo elemento\n3. Tercer elemento\n\n### Código Python\n```python\ndef hola_mundo():\n    print('¡Hola desde Python!')\n    return 'Éxito'\n```\n\n### Enlace\n[Visita Google](https://www.google.com)\n\n### Cita\n> Esta es una cita importante que demuestra el formato de blockquote.\n\n### Tabla\n| Campo | Valor |\n|-------|-------|\n| Nombre | Agente |\n| Tipo | IA |\n| Estado | Activo |",
                          timestamp: new Date().toISOString(),
                        }
                        setMessages(prev => [...prev, testMessage])
                      }}
                    >
                      🧪 Probar Markdown Completo
                    </Button>
                  </div>
            )}
          </div>
        </div>

        {/* Mensajes */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4" 
          style={{ maxHeight: 'calc(100vh - 400px)' }}  
        >
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
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="markdown-content">
                    <div>
                      <div style={{display: 'none'}}>
                        DEBUG: {JSON.stringify(message.content)}
                      </div>
                      <div className="prose max-w-none">
                        {(() => {
                          const processedContent = normalizeContent(message.content);
                          console.log('🎯 ReactMarkdown recibiendo:', processedContent);
                          return (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                            >
                              {processedContent}
                            </ReactMarkdown>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
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
          
          {/* Indicador de scroll automático y botón para ir al final */}
          {messages.length > 0 && (
            <div className="flex justify-center pt-2 space-x-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Scroll automático activo
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-xs"
              >
                Ir al final
              </Button>
            </div>
          )}
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
                     <CardContent className="h-[calc(100%-80px)] p-0">
             {session ? (
               <div className="h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                 <TraceViewer items={traces} />
               </div>
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
