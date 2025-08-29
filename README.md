# AutoAgentes Frontend

Frontend para la plataforma AutoAgentes - Gestión de Agentes IA con herramientas MCP.

## 🚀 Características

- **Gestión de Agentes**: Crear, configurar y gestionar agentes de IA
- **MCP Servers**: Configurar servidores MCP y descubrir herramientas
- **Chat en Tiempo Real**: Conversar con agentes con trazas estructuradas
- **Trace Viewer**: Visualización en tiempo real de la ejecución de agentes
- **Analytics**: Métricas y gráficos de uso y rendimiento
- **Drag & Drop**: Gestión visual de herramientas por agentes
- **SignalR**: Comunicación en tiempo real con el backend

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript** + **Vite**
- **React Router v6** para routing
- **TanStack Query** para cache de datos
- **Zustand** para estado UI
- **SignalR** para comunicación en tiempo real
- **Tailwind CSS** + **shadcn/ui** para UI
- **Recharts** para gráficos
- **Lucide React** para iconos

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd autoagentes-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tu configuración:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_KEY=your-dev-api-key-here
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/trace
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Composición de rutas y layout
├── components/             # UI atómica (cards, tables, dialogs)
├── features/
│   ├── agents/            # Páginas + hooks + servicios de agentes
│   ├── mcp/               # Servidores MCP y tools
│   ├── sessions/          # Chat y trace viewer
│   └── analytics/         # Paneles y charts
├── hooks/                 # Hooks compartidos (SignalR, DnD)
├── lib/                   # apiClient, queryClient, validators, utils
├── store/                 # Zustand stores (UI state)
├── types/                 # DTOs TS alineados con el backend
└── styles/                # tailwind.css + tokens
```

## 🎯 Funcionalidades Principales

### Dashboard
- Resumen de agentes activos
- Sesiones recientes
- Métricas de consumo
- Estado de servidores MCP

### Gestión de Agentes
- Listado con filtros y búsqueda
- Creación y configuración de agentes
- Gestión de herramientas por drag & drop
- Configuración de políticas de guardrails
- Chat integrado con trace viewer

### MCP Servers
- Configuración de servidores MCP
- Descubrimiento automático de herramientas
- Prueba de conectividad
- Gestión de herramientas disponibles

### Chat y Trazas
- Chat en tiempo real con agentes
- Visualización de trazas estructuradas
- Control de sesiones (pausar/reanudar)
- Retry de pasos fallidos

### Analytics
- Métricas de uso por agente
- Gráficos de costes y latencias
- Análisis de herramientas más usadas
- Historial de sesiones

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Tests
npm run test
npm run test:ui

# Tests E2E
npm run test:e2e
```

## 🌐 Rutas de la Aplicación

- `/` - Dashboard principal
- `/agents` - Listado de agentes
- `/agents/:id` - Detalle del agente con pestañas
- `/mcp` - Gestión de servidores MCP
- `/sessions/:id` - Vista de sesión individual
- `/settings` - Configuración de la aplicación

## 🔌 Integración con Backend

El frontend se integra con el backend a través de:

1. **API REST**: Para operaciones CRUD
2. **SignalR**: Para trazas en tiempo real
3. **WebSockets**: Para comunicación bidireccional

### Configuración del Backend

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Configuración del backend
VITE_API_BASE_URL=http://localhost:5000/api

# Configuración de desarrollo
VITE_DEV_MODE=true
```

**Nota importante**: Asegúrate de que el backend esté ejecutándose en la URL especificada antes de usar el frontend.

### Endpoints Disponibles

Según el Swagger del backend, estos son los endpoints disponibles:

- `GET /agents` - Listar agentes
- `POST /agents` - Crear agente
- `GET /agents/:id` - Obtener agente
- `PATCH /agents/:id` - Actualizar agente
- `GET /agents/:id/bindings` - Listar bindings
- `POST /agents/:id/bindings` - Crear binding
- `DELETE /agents/:id/bindings/:bindingId` - Eliminar binding
- `POST /sessions` - Crear sesión
- `GET /sessions/:id` - Obtener sesión
- `POST /sessions/:id/messages` - Enviar mensaje
- `GET /sessions/:id/trace` - Obtener trazas
- `POST /sessions/:id:pause` - Pausar sesión
- `POST /sessions/:id:resume` - Reanudar sesión
- `POST /sessions/:id:cancel` - Cancelar sesión
- `POST /sessions/:id:retryLastStep` - Reintentar último paso
- `GET /mcp/servers` - Listar servidores MCP
- `POST /mcp/servers` - Crear servidor MCP
- `POST /mcp/servers/:id/discover` - Descubrir herramientas
- `GET /mcp/tools` - Listar herramientas (con query param serverId)

## 🎨 Temas y Personalización

La aplicación soporta:
- Tema claro/oscuro/sistema
- Personalización de colores
- Configuración de notificaciones
- Preferencias de usuario

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con UI
npm run test:ui

# Tests E2E con Playwright
npm run test:e2E
```

## 📦 Build y Despliegue

```bash
# Build de producción
npm run build

# El resultado estará en /dist
```

### Despliegue en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Despliegue en Azure Static Web Apps

1. Configurar GitHub Actions
2. Definir variables de entorno
3. Deploy automático

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación del backend

## ⚠️ Limitaciones Actuales

### Endpoints No Disponibles en el Backend
Algunas funcionalidades están comentadas porque los endpoints no existen en el backend actual:

- **MCP Servers**: 
  - ❌ `GET /mcp/servers/{id}` - Obtener servidor específico
  - ❌ `PATCH /mcp/servers/{id}` - Actualizar servidor
  - ❌ `DELETE /mcp/servers/{id}` - Eliminar servidor
  - ❌ `POST /mcp/servers/{id}/test` - Probar conexión

- **Tools**:
  - ❌ `GET /mcp/tools/{id}` - Obtener herramienta específica
  - ❌ `PATCH /mcp/tools/{id}` - Actualizar herramienta
  - ❌ `POST /mcp/tools/{id}/enable` - Habilitar/deshabilitar herramienta

- **Agents**:
  - ❌ `DELETE /agents/{id}` - Eliminar agente
  - ❌ `PATCH /agents/{id}/bindings/{bindingId}` - Actualizar binding

- **Sessions**:
  - ❌ `GET /sessions` - Listar sesiones
  - ❌ `GET /sessions/{id}/trace/{stepId}` - Obtener paso específico

### Funcionalidades Comentadas
- Botones de "Probar conexión" y "Eliminar servidor" en MCP
- Toggle de habilitar/deshabilitar herramientas
- Listado de sesiones en Dashboard y Analytics
- Actualización de bindings de herramientas

## 🗺️ Roadmap

### v0.2 - Funcionalidades Avanzadas
- [ ] Drag & Drop avanzado para herramientas
- [ ] Editor Monaco para políticas
- [ ] Templates AIFoundry
- [ ] Exportación de datos
- [ ] Modo offline
- [ ] PWA
- [ ] Tests E2E completos
- [ ] Internacionalización (i18n)
- [ ] Temas personalizables
- [ ] Dashboard personalizable
