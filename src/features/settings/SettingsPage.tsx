import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Monitor,
  Key,
  Globe,
  Bell,
  Shield,
  Save
} from 'lucide-react'

export function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [notifications, setNotifications] = useState(true)

  const handleSaveSettings = () => {
    // TODO: Implementar guardado de configuración
    console.log('Guardando configuración...')
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    // TODO: Implementar cambio de tema
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona las preferencias y configuración de la aplicación
        </p>
      </div>

      {/* Configuración de API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configuración de API
          </CardTitle>
          <CardDescription>
            Configura la conexión con el backend de AutoAgentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">URL Base del Backend</label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.autoagentes.com"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL del servidor backend de AutoAgentes
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">API Key (Desarrollo)</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Tu API key para desarrollo"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Solo para desarrollo. En producción se usará autenticación OAuth.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">Desarrollo</Badge>
            <span className="text-sm text-muted-foreground">
              Modo de autenticación actual
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza la apariencia de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tema</label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Oscuro
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('system')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Sistema
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura las notificaciones de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Notificaciones en tiempo real</label>
                <p className="text-xs text-muted-foreground">
                  Recibe notificaciones sobre el estado de las sesiones
                </p>
              </div>
              <Button
                variant={notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? 'Activadas' : 'Desactivadas'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
          <CardDescription>
            Información sobre la aplicación y el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Versión:</span>
              <span className="text-sm text-muted-foreground">v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Entorno:</span>
              <span className="text-sm text-muted-foreground">Desarrollo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Navegador:</span>
              <span className="text-sm text-muted-foreground">
                {navigator.userAgent.split(' ').pop()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Idioma:</span>
              <span className="text-sm text-muted-foreground">Español (ES)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          Restaurar por defecto
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  )
}
