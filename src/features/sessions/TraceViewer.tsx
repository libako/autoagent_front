import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, sanitizeJson } from '@/lib/utils'
import { 
  List, 
  Wrench, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Clock
} from 'lucide-react'
import type { TraceEvent } from '@/types/domain'

interface TraceViewerProps {
  items: { kind: TraceEvent["kind"]; payload: any; at: string; idx?: number }[]
}

export function TraceViewer({ items }: TraceViewerProps) {
  // Mostrar solo los tipos útiles
  const allowedKinds: TraceEvent["kind"][] = [
    'plan',
    'tool_call',
    'observation',
    'summary',
    'error',
  ]
  const visibleItems = items.filter((it) => allowedKinds.includes(it.kind))

  const getTraceIcon = (kind: TraceEvent["kind"]) => {
    switch (kind) {
      case "plan": return <List className="h-4 w-4" />
      case "tool_call": return <Wrench className="h-4 w-4" />
      case "observation": return <Eye className="h-4 w-4" />
      case "summary": return <CheckCircle className="h-4 w-4" />
      case "error": return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const getTraceColor = (kind: TraceEvent["kind"]) => {
    switch (kind) {
      case "plan": return "bg-blue-100 text-blue-800 border-blue-200"
      case "tool_call": return "bg-purple-100 text-purple-800 border-purple-200"
      case "observation": return "bg-green-100 text-green-800 border-green-200"
      case "summary": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "error": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTraceTitle = (kind: TraceEvent["kind"]) => {
    switch (kind) {
      case "plan": return "Plan"
      case "tool_call": return "Llamada a Herramienta"
      case "observation": return "Observación"
      case "summary": return "Resumen"
      case "error": return "Error"
      default: return ""
    }
  }

  const handleRetryStep = (idx: number) => {
    // TODO: Implementar retry de step
    console.log('Retry step:', idx)
  }

  return (
    <div className="h-full overflow-y-auto space-y-3 pr-2">
      {visibleItems.slice().reverse().map((item, index) => (
        <Card key={`${item.at}-${index}`} className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${getTraceColor(item.kind)}`}>
                  {getTraceIcon(item.kind)}
                </div>
                {getTraceTitle(item.kind) && (
                  <CardTitle className="text-sm">{getTraceTitle(item.kind)}</CardTitle>
                )}
                {item.idx !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    #{item.idx}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.at)}
                </span>
                {item.kind === 'tool_call' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRetryStep(item.idx || index)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {/* Contenido específico por tipo */}
              {item.kind === 'plan' && (
                <div>
                  <CardDescription className="mb-2">Pasos del plan:</CardDescription>
                  {Array.isArray(item.payload.steps) ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {item.payload.steps.map((step: string, i: number) => (
                        <li key={i} className="text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {item.payload.description || 'Plan generado'}
                    </p>
                  )}
                </div>
              )}

              {item.kind === 'tool_call' && (
                <div>
                  <CardDescription className="mb-2">Detalles de la llamada:</CardDescription>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Herramienta:</span>
                      <span className="text-muted-foreground">{item.payload.tool || item.payload.name}</span>
                    </div>
                    {item.payload.args && (
                      <div>
                        <span className="font-medium">Argumentos:</span>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {sanitizeJson(item.payload.args)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {item.kind === 'observation' && (
                <div>
                  <CardDescription className="mb-2">Resultado:</CardDescription>
                  <div className="space-y-1 text-sm">
                    {item.payload.latency && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latencia:</span>
                        <span className="text-muted-foreground">{item.payload.latency}ms</span>
                      </div>
                    )}
                    {item.payload.result && (
                      <div>
                        <span className="font-medium">Resultado:</span>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {sanitizeJson(item.payload.result)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {item.kind === 'summary' && (
                <div>
                  <CardDescription className="mb-2">Resumen de la ejecución:</CardDescription>
                  <p className="text-sm text-muted-foreground">
                    {item.payload.content || item.payload.summary || 'Ejecución completada'}
                  </p>
                  {item.payload.cost && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Coste: ${item.payload.cost.toFixed(4)}
                    </div>
                  )}
                </div>
              )}

              {item.kind === 'error' && (
                <div>
                  <CardDescription className="mb-2">Error detectado:</CardDescription>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo:</span>
                      <span className="text-red-600">{item.payload.type || 'Error'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Mensaje:</span>
                      <p className="text-red-600 mt-1">{item.payload.message || 'Error desconocido'}</p>
                    </div>
                    {item.payload.suggestion && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="font-medium text-yellow-800">Sugerencia:</span>
                        <p className="text-yellow-700 text-sm mt-1">{item.payload.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* JSON completo para debugging */}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Ver JSON completo
                </summary>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                  {sanitizeJson(item.payload)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      ))}

      {visibleItems.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Esperando eventos de trace...
          </p>
        </div>
      )}
    </div>
  )
}
