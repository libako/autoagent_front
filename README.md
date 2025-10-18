# AutoAgent Frontend

Frontend para la aplicación AutoAgent con soporte completo para markdown en el chat.

## 🚀 Características Principales

### **Chat con Soporte Completo de Markdown**
Las respuestas del agente ahora soportan formato markdown completo y profesional:

#### 📝 **Markdown Básico**
- **Encabezados**: H1, H2, H3, H4, H5, H6 con estilos jerárquicos
- **Formato de texto**: Negrita, cursiva, tachado, subíndices, superíndices
- **Listas**: Ordenadas, no ordenadas y anidadas
- **Enlaces**: Internos y externos con estilos de hover
- **Párrafos**: Con espaciado y tipografía optimizados

#### 💻 **Código y Sintaxis**
- **Código inline**: `código` con fondo y bordes redondeados
- **Bloques de código**: Con identificador de lenguaje y scroll horizontal
- **Resaltado de sintaxis**: Soporte para Python, JavaScript, SQL, TypeScript, etc.
- **Preformateado**: Bloques `<pre>` con estilos personalizados

#### 📊 **Elementos Estructurados**
- **Tablas**: Responsivas con bordes, hover effects y scroll horizontal
- **Citas**: Con borde izquierdo, fondo y estilos tipográficos
- **Separadores**: Líneas horizontales con espaciado
- **Imágenes**: Responsive con bordes y estilos adaptativos

#### 🎯 **GitHub Flavored Markdown (GFM)**
- **Listas de tareas**: Checkboxes interactivos
- **Strikethrough**: Texto tachado con estilos
- **Enlaces automáticos**: Detección automática de URLs
- **Tablas avanzadas**: Con alineación y estilos mejorados

#### 🎨 **Estilos Personalizados**
- **Tema adaptativo**: Soporte completo para modo claro y oscuro
- **Colores consistentes**: Integración con tu sistema de diseño
- **Responsive design**: Adaptable a todos los tamaños de pantalla
- **Hover effects**: Transiciones suaves y efectos interactivos
- **Tipografía optimizada**: Espaciado y legibilidad mejorados

## 🛠️ Tecnologías Implementadas

- **React 18** + **TypeScript** + **Vite**
- **React Markdown**: Renderizado de markdown
- **Remark GFM**: GitHub Flavored Markdown
- **Remark Breaks**: Saltos de línea automáticos
- **Remark Math**: Soporte para matemáticas
- **Rehype Katex**: Renderizado de fórmulas matemáticas
- **Rehype Highlight**: Resaltado de sintaxis de código
- **Tailwind CSS**: Estilos y diseño responsivo
- **shadcn/ui**: Componentes de UI modernos

## 📦 Instalación

```bash
npm install
```

## 🚀 Desarrollo

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🎯 Cómo Funciona el Markdown

### **Para el Usuario**
1. Escribe tu mensaje normalmente (sin markdown)
2. El agente responde con contenido formateado
3. El markdown se renderiza automáticamente

### **Para el Agente**
El agente puede usar toda la sintaxis markdown:

```markdown
# Título Principal

## Análisis del Código

He revisado tu implementación y encontré algunos **problemas críticos**:

### Problemas Identificados:
- ❌ Variable no inicializada
- ⚠️ Falta validación de entrada
- ✅ La lógica principal está correcta

### Solución Recomendada:

```python
def funcion_mejorada():
    # Inicializar variables
    resultado = 0
    
    # Validar entrada
    if entrada_valida:
        resultado = procesar_datos()
    
    return resultado
```

### Métricas de Rendimiento:

| Métrica | Valor | Estado |
|---------|-------|--------|
| Precisión | 95.2% | ✅ Excelente |
| Latencia | 150ms | ⚠️ Mejorable |

> **Nota importante**: Siempre valida las entradas antes de procesarlas.
```

## 🔍 Ejemplos de Uso Real

### **Respuesta con Código**
- Análisis de código con resaltado de sintaxis
- Explicaciones técnicas con formato estructurado
- Recomendaciones organizadas en listas

### **Respuesta con Datos**
- Tablas de métricas y resultados
- Gráficos descritos con markdown
- Estadísticas organizadas y legibles

### **Respuesta con Instrucciones**
- Pasos numerados y organizados
- Listas de verificación interactivas
- Enlaces a recursos externos

## 🎨 Personalización de Estilos

Los estilos están completamente personalizables en `src/styles/globals.css`:

- **Colores**: Integrados con tu sistema de diseño
- **Tipografía**: Espaciado y tamaños optimizados
- **Responsive**: Adaptable a todos los dispositivos
- **Temas**: Soporte para modo claro y oscuro

## 🚀 Próximas Funcionalidades

- [ ] Resaltado de sintaxis avanzado con Prism.js
- [ ] Soporte completo para matemáticas LaTeX
- [ ] Diagramas con Mermaid
- [ ] Emojis y iconos personalizados
- [ ] Exportación a PDF/HTML

## 📚 Documentación

- **`MARKDOWN_DEMO.md`**: Demostración completa de todas las funcionalidades
- **`src/styles/globals.css`**: Estilos personalizados para markdown
- **`src/features/sessions/ChatTab.tsx`**: Implementación del componente

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

---

**¡El soporte de markdown en AutoAgent está completamente funcional y listo para usar!** 🎉

Ahora puedes disfrutar de respuestas del agente con formato profesional, código resaltado, tablas organizadas y mucho más.
