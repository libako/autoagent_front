# 🚀 Guía de Renderizado de Markdown - Frontend

## 🚨 **Problema Identificado**

El problema principal es que el contenido viene envuelto en un fence `markdown` global, lo que hace que **todo el contenido dentro se trate como texto literal** hasta que se cierre el fence. Por eso el markdown antes del bloque de código no se renderiza.

## ✅ **Solución Implementada**

### 1. **Función para Desenvolver Fence Global**

```typescript
// Función para desenvolver fence global de markdown
function unwrapTopLevelMarkdownFence(s: string): string {
  const m = s.match(/^```(?:markdown)?\s*([\s\S]*?)\s*```$/);
  return m ? m[1] : s;
}

// Función para normalizar contenido
function normalizeContent(content: string): string {
  // Quitar BOM y normalizar saltos de línea
  const normalized = String(content).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  // Desenvolver fence global si existe
  return unwrapTopLevelMarkdownFence(normalized);
}
```

### 2. **Configuración Recomendada de ReactMarkdown**

```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

<div className="prose max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
  >
    {normalizeContent(message.content)}
  </ReactMarkdown>
</div>
```

## 🎯 **Por Qué Funciona**

1. **`unwrapTopLevelMarkdownFence`**: Detecta y remueve el fence global `markdown` que envuelve todo el contenido
2. **`normalizeContent`**: Normaliza saltos de línea y quita BOM
3. **`remarkGfm`**: GitHub Flavored Markdown (tablas, task-lists, etc.)
4. **`rehypeHighlight`**: Resaltado de sintaxis para bloques de código
5. **`prose max-w-none`**: Clase de Tailwind para tipografía correcta

## 🧪 **Casos de Prueba**

### Caso A: Contenido con Fence Global (Problema Original)
```markdown
```markdown
# Título Principal

## Subtítulo

Este es un **párrafo** con *formato*.

### Código Python
```python
def hola_mundo():
    print('¡Hola desde Python!')
    return 'Éxito'
```

### Enlace
[Visita Google](https://www.google.com)
```
```

**Resultado**: ✅ Se renderiza correctamente todo el markdown

### Caso B: Contenido Sin Fence Global
```markdown
# Título Principal

## Subtítulo

Este es un **párrafo** con *formato*.

### Código Python
```python
def hola_mundo():
    print('¡Hola desde Python!')
    return 'Éxito'
```

### Enlace
[Visita Google](https://www.google.com)
```

**Resultado**: ✅ Se renderiza correctamente

## 🔧 **Configuración Completa**

```typescript
// Imports
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// Funciones auxiliares
function unwrapTopLevelMarkdownFence(s: string): string {
  const m = s.match(/^```(?:markdown)?\s*([\s\S]*?)\s*```$/);
  return m ? m[1] : s;
}

function normalizeContent(content: string): string {
  const normalized = String(content).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  return unwrapTopLevelMarkdownFence(normalized);
}

// Componente
<div className="prose max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
  >
    {normalizeContent(message.content)}
  </ReactMarkdown>
</div>
```

## 📋 **Reglas de Autoría de Markdown**

### ✅ **Correcto**
- **Para mostrar Markdown "vivo"**: No envolver en `markdown`
- **Para mostrar Markdown "en crudo"**: Usar fence más largo (````markdown) o tildes (`~~~`)

### ❌ **Incorrecto**
- Envolver contenido "vivo" en `markdown` (causa el problema original)

## 🎨 **CSS Recomendado**

```css
/* Evitar reglas globales que rompan el render */
.markdown-content * {
  /* NO usar white-space: pre aquí */
}

/* Limitar white-space: pre solo a elementos específicos */
.markdown-content pre,
.markdown-content code {
  white-space: pre;
}

/* Si usas Tailwind agresivo, aplicar prose */
.prose {
  /* Estilos de tipografía correctos */
}
```

## 🧪 **Guía Rápida para QA**

1. **Caso A (render "vivo")**: ✅ No envolver en `markdown`
2. **Caso B (mostrar Markdown "en crudo")**: ✅ Usar ```` externo o `~~~` externas
3. **Verificar**: ✅ `remark-gfm` activo (tablas, task-lists, etc.)
4. **Confirmar**: ✅ Resaltado de sintaxis funciona en bloques de código

## 📚 **Referencias**

- [CommonMark - Fenced code blocks](https://spec.commonmark.org/current/)
- [GitHub Docs - Code blocks](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [rehype-highlight](https://github.com/rehypejs/rehype-highlight)

## 🎉 **Resultado Final**

Ahora el markdown se renderiza correctamente en **toda** la secuencia:

1. **Antes del bloque de código**: ✅ Funciona
2. **Dentro del bloque de código**: ✅ Funciona con resaltado de sintaxis
3. **Después del bloque de código**: ✅ Funciona

¡La solución está completa y funcionando! 🚀

