import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AgentApi } from '../agentApi'
import { toast } from 'sonner'
import { 
  Shield, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import type { Agent } from '@/types/domain'

interface PolicyTabProps {
  agent: Agent
}

export function PolicyTab({ agent }: PolicyTabProps) {
  const [policyJson, setPolicyJson] = useState(
    agent.guardrailsJson ? JSON.stringify(agent.guardrailsJson, null, 2) : ''
  )
  const [isValid, setIsValid] = useState(true)
  const queryClient = useQueryClient()

  const updatePolicyMutation = useMutation({
    mutationFn: (guardrailsJson: any) =>
      AgentApi.patch(agent.id, { guardrailsJson }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agent.id] })
      toast.success('Política de guardrails actualizada correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar la política de guardrails')
    },
  })

  const validateJson = (jsonString: string) => {
    try {
      if (jsonString.trim() === '') {
        setIsValid(true)
        return null
      }
      const parsed = JSON.parse(jsonString)
      setIsValid(true)
      return parsed
    } catch (error) {
      setIsValid(false)
      return null
    }
  }

  const handleJsonChange = (value: string) => {
    setPolicyJson(value)
    validateJson(value)
  }

  const handleSave = () => {
    const parsed = validateJson(policyJson)
    if (parsed !== undefined) {
      updatePolicyMutation.mutate(parsed)
    }
  }

  const handleReset = () => {
    setPolicyJson(
      agent.guardrailsJson ? JSON.stringify(agent.guardrailsJson, null, 2) : ''
    )
    setIsValid(true)
  }

  const examplePolicy = {
    "rules": [
      {
        "name": "no_personal_data",
        "description": "No compartir información personal",
        "pattern": "\\b(?:dni|pasaporte|email|teléfono|dirección)\\b",
        "action": "block",
        "message": "No puedo procesar información personal"
      },
      {
        "name": "no_financial_advice",
        "description": "No dar consejos financieros",
        "pattern": "\\b(?:invertir|comprar acciones|bitcoin|crypto)\\b",
        "action": "warn",
        "message": "No puedo dar consejos financieros específicos"
      }
    ],
    "max_tokens_per_response": 1000,
    "temperature_limit": 0.7,
    "forbidden_topics": [
      "información personal",
      "consejos médicos",
      "consejos legales"
    ]
  }

  return (
    <div className="space-y-6">
      {/* Editor JSON */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Política de Guardrails
              </CardTitle>
              <CardDescription>
                Define reglas y restricciones para el comportamiento del agente
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={updatePolicyMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isValid || updatePolicyMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Validación */}
            <div className="flex items-center space-x-2">
              {isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {isValid ? 'JSON válido' : 'JSON inválido'}
              </span>
            </div>

            {/* Editor */}
            <div className="border rounded-lg">
              <textarea
                value={policyJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none ${
                  isValid ? 'bg-background' : 'bg-red-50'
                }`}
                placeholder="Ingresa la política de guardrails en formato JSON..."
              />
            </div>

            {/* Ejemplo */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Ver ejemplo de política
              </summary>
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(examplePolicy, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>

      {/* Información sobre guardrails */}
      <Card>
        <CardHeader>
          <CardTitle>Información sobre Guardrails</CardTitle>
          <CardDescription>
            Cómo configurar políticas de seguridad para tu agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">¿Qué son los guardrails?</h4>
              <p className="text-muted-foreground">
                Los guardrails son reglas que limitan y controlan el comportamiento del agente,
                protegiendo contra respuestas inapropiadas o peligrosas.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tipos de reglas:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>block:</strong> Bloquea completamente la respuesta</li>
                <li><strong>warn:</strong> Permite la respuesta pero muestra una advertencia</li>
                <li><strong>filter:</strong> Elimina contenido específico de la respuesta</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Campos disponibles:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>rules:</strong> Array de reglas con patrones y acciones</li>
                <li><strong>max_tokens_per_response:</strong> Límite de tokens por respuesta</li>
                <li><strong>temperature_limit:</strong> Límite de temperatura del modelo</li>
                <li><strong>forbidden_topics:</strong> Lista de temas prohibidos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
