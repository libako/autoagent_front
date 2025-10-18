# 🚀 Solución Final: Extracción de JSON + Markdown

## 🚨 **Problema Identificado**

El usuario reportó que:
- ✅ **Botón "Probar Markdown Completo"**: Funciona correctamente
- ❌ **Respuesta del servidor**: No funciona

## **Causa del Problema:**

La diferencia estaba en el **formato del contenido**:

### **Botón "Probar Markdown Completo"** (Funciona):
```typescript
content: "# Título Principal\n\n## Subtítulo\n..."
```

### **Servidor** (No funcionaba):
```typescript
content: '{"content": "# Título Principal\\n\\n## Subtítulo\\n..."}'
```

## ✅ **Solución Implementada**

### 1. **Función para Extraer Contenido de JSON**

```typescript
// Función para extraer contenido de JSON
function extractContentFromJson(content: string): string {
  console.log('🔍 extractContentFromJson - Input:', content.substring(0, 100) + '...');
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && parsed.content) {
      console.log('✅ Contenido extraído del JSON:', parsed.content.substring(0, 100) + '...');
      return parsed.content;
    }
  } catch (error) {
    console.log('❌ No es JSON válido, devolviendo original');
  }
  return content;
}
```

### 2. **Función de Normalización Actualizada**

```typescript
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
```

## 🎯 **Flujo de Procesamiento**

1. **Input**: `'{"content": "# Título\\n\\n## Subtítulo\\n..."}'`
2. **`extractContentFromJson`**: Extrae `"# Título\n\n## Subtítulo\n..."`
3. **`normalizeContent`**: Normaliza saltos de línea
4. **`unwrapTopLevelMarkdownFence`**: Remueve fences globales si existen
5. **Output**: `"# Título\n\n## Subtítulo\n..."`
6. **ReactMarkdown**: Renderiza el markdown correctamente

## 🧪 **Casos de Prueba**

### Caso A: Contenido JSON del Servidor
```json
{"content": "# Título Principal\n\n## Subtítulo\n\nEste es un **párrafo** con *formato*."}
```

**Resultado**: ✅ Se extrae el contenido y se renderiza correctamente

### Caso B: Contenido Directo (Botón de Prueba)
```markdown
# Título Principal

## Subtítulo

Este es un **párrafo** con *formato*.
```

**Resultado**: ✅ Se procesa directamente y se renderiza correctamente

### Caso C: Contenido JSON con Fence Global
```json
{"content": "```markdown\n# Título\n\n## Subtítulo\n```"}
```

**Resultado**: ✅ Se extrae, se remueve el fence global y se renderiza correctamente

## 🔧 **Configuración Completa**

```typescript
// Imports
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// Funciones auxiliares
function extractContentFromJson(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && parsed.content) {
      return parsed.content;
    }
  } catch (error) {
    // No es JSON válido, devolver original
  }
  return content;
}

function unwrapTopLevelMarkdownFence(s: string): string {
  const trimmed = s.trim();
  const markdownFenceRegex = /^```markdown\s*([\s\S]*?)\s*```$/;
  const genericFenceRegex = /^```\s*([\s\S]*?)\s*```$/;
  
  // Primero intentar con fence específico de markdown
  let match = trimmed.match(markdownFenceRegex);
  if (match) {
    return match[1];
  }
  
  // Si no, intentar con fence genérico solo si el contenido parece ser markdown
  match = trimmed.match(genericFenceRegex);
  if (match) {
    const content = match[1];
    if (content.trim().startsWith('#') || content.includes('##') || content.includes('**') || content.includes('*')) {
      return content;
    }
  }
  
  return s;
}

function normalizeContent(content: string): string {
  // Primero extraer contenido del JSON si es necesario
  const extractedContent = extractContentFromJson(content);
  
  // Quitar BOM y normalizar saltos de línea
  const normalized = String(extractedContent).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  // Desenvolver fence global si existe
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

## 🎉 **Resultado Final**

Ahora **ambos casos** funcionan correctamente:

1. **Botón "Probar Markdown Completo"**: ✅ Funciona (contenido directo)
2. **Respuesta del servidor**: ✅ Funciona (contenido JSON extraído)

La solución maneja automáticamente:
- ✅ Contenido JSON del servidor
- ✅ Contenido directo de botones de prueba
- ✅ Fences globales de markdown
- ✅ Normalización de saltos de línea
- ✅ Resaltado de sintaxis

¡La solución está completa y funcionando! 🚀

