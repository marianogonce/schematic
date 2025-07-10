# Angular Schematic Generation Prompt Template

Este documento sirve como plantilla para generar esquemáticos Angular con GitHub Copilot. Úsalo para crear nuevos esquemáticos que automaticen tareas comunes de desarrollo en Angular.

## ¿Qué son los Esquemáticos Angular?

Los esquemáticos son herramientas de generación y transformación de código que permiten automatizar tareas repetitivas, aplicar mejores prácticas y mantener la consistencia en proyectos Angular. Un esquemático puede:

- Generar nuevos archivos (componentes, servicios, etc.)
- Modificar código existente (añadir propiedades, métodos, imports)
- Refactorizar código a gran escala (aplicar patrones, actualizar sintaxis)
- Implementar automáticamente patrones complejos

## Instrucciones para Copilot

Quiero crear un esquemático Angular que automatice tareas de transformación de código. Por favor, ayúdame a generar el código necesario para un esquemático con las siguientes características:

### 1. Información General

- **Nombre del esquemático**: [NOMBRE_ESQUEMÁTICO]
- **Descripción**: [DESCRIPCIÓN_BREVE]
- **Funcionalidad principal**: [TRANSFORMACIÓN_CÓDIGO]
- **Tecnologías**: Angular, TypeScript, AST, ts-morph

### 2. Estructura del Proyecto

Necesito todos los archivos para un esquemático completo:

- **collection.json**: Definición de esquemáticos disponibles
- **schema.json**: Configuración de opciones del esquemático
- **schema.ts**: Interfaces TypeScript para las opciones
- **index.ts**: Implementación principal del esquemático

### 3. Transformación a Realizar

El esquemático debe ser capaz de:

- **Detectar**: [PATRÓN_CÓDIGO_A_DETECTAR]
- **Transformar**: [PATRÓN_CÓDIGO_A_GENERAR]
- **Entorno**: Archivos [TIPO_ARCHIVOS] en proyectos Angular
- **Condiciones**: Aplicar solo cuando [CONDICIONES_ESPECÍFICAS]

### 4. Implementación Técnica

Utiliza ts-morph para manipulación de AST con las siguientes consideraciones:

- **Análisis de AST**: Detección robusta de patrones en el código mediante visitors y traversal
- **Transformación segura**: Preservar el código existente y evitar errores
- **Gestión de imports**: Añadir/eliminar imports según sea necesario
- **Manejo de errores**: Implementar recuperación ante casos problemáticos
- **Preservación de estilo**: Mantener el formato, indentación y estilo del código original
- **Validación de AST**: Verificar que el árbol sintáctico resultante sea válido antes de aplicar cambios

### 5. Opciones del Esquemático

El esquemático debe soportar las siguientes opciones:

- **path**: Ruta donde aplicar la transformación (default: "src")
- **project**: Nombre del proyecto Angular cuando hay múltiples proyectos
- **[OPCIÓN_PERSONALIZADA_1]**: [DESCRIPCIÓN]
- **[OPCIÓN_PERSONALIZADA_2]**: [DESCRIPCIÓN]
- **skipBackup**: Omitir la creación de copias de seguridad de los archivos modificados
- **dryRun**: Ejecutar sin hacer cambios (visualización previa)

### 6. Estrategia de Testing

Para garantizar la fiabilidad del esquemático:

- **Casos de prueba**: Define pruebas unitarias para diferentes escenarios de transformación
- **Fixtures**: Prepara archivos de ejemplo para verificar transformaciones
- **Validación**: Comprueba que el código generado compile correctamente
- **Edge cases**: Prueba situaciones límite como código malformado o patrones inusuales

## Ejemplo de Transformación

### Código Antes:

```typescript
// Ejemplo del código que será transformado
```

### Código Después:

```typescript
// Ejemplo del código después de la transformación
```

## Estructura Detallada

Por favor, genera código para:

1. **collection.json**: Con la configuración adecuada del esquemático
   ```json
   {
     "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
     "schematics": {
       "[nombre-esquemático]": {
         "description": "[descripción]",
         "factory": "./[nombre-esquemático]/index#[nombreFunción]",
         "schema": "./[nombre-esquemático]/schema.json"
       }
     }
   }
   ```

2. **schema.json**: Con todas las opciones configurables
   ```json
   {
     "$schema": "http://json-schema.org/schema",
     "id": "[NombreEsquemático]Schema",
     "title": "[Título] Schema",
     "type": "object",
     "properties": {
       "path": {
         "type": "string",
         "description": "La ruta donde aplicar la transformación",
         "$default": {
           "$source": "workingDirectory"
         }
       },
       "customOption": {
         "type": "string",
         "description": "Descripción de la opción personalizada"
       }
     },
     "required": []
   }
   ```

3. **schema.ts**: Con las interfaces TypeScript correctas
   ```typescript
   export interface Schema {
     path?: string;
     project?: string;
     customOption?: string;
     skipBackup?: boolean;
     dryRun?: boolean;
   }
   ```

4. **index.ts**: Con la implementación completa del esquemático usando ts-morph para:
   - Recolección de archivos
   - Análisis de AST
   - Transformación de código
   - Gestión de imports
   - Manejo de casos especiales
   - Logging informativo
   - Sistema de backup (opcional)
   - Validación de transformaciones
   - Manejo robusto de errores

## Consideraciones Técnicas

1. **Manipulación de AST**: Usar técnicas avanzadas con ts-morph y TypeScript Compiler API
2. **Seguridad**: No modificar código que no deba ser modificado y validar siempre antes de aplicar cambios
3. **Logging**: Proporcionar registro detallado de operaciones realizadas y cambios aplicados
4. **Robustez**: Manejar correctamente casos límite y situaciones de error con graceful degradation
5. **Rendimiento**: Optimizar para proyectos grandes con muchos archivos
6. **Idempotencia**: Garantizar que ejecutar el esquemático múltiples veces no cause problemas
7. **Detección Inteligente**: Implementar heurísticas para detectar patrones complejos
8. **Preservación**: Mantener comentarios, formato y estilo del código original

---

### Instrucciones de Uso:

1. Reemplaza los campos entre corchetes [CAMPO] con tus requisitos específicos
2. Proporciona ejemplos claros de código antes/después de la transformación
3. Solicita a Copilot que genere los archivos necesarios
4. Revisa y adapta el código generado según tus necesidades específicas

### Estructura de Proyecto Recomendada

```
my-schematic/
├── README.md                  # Documentación
├── package.json               # Configuración del paquete
├── tsconfig.json              # Configuración TypeScript
├── src/
│   ├── collection.json        # Definición de esquemáticos
│   └── my-schematic/          # Carpeta para el esquemático
│       ├── index.ts           # Implementación principal
│       ├── schema.json        # Definición de opciones
│       └── schema.ts          # Interfaces TypeScript
└── test/                      # Pruebas unitarias
```

### Comandos NPM Útiles

```json
{
  "scripts": {
    "build": "tsc && npm run copy:json",
    "copy:json": "cp -r src/*.json dist/",
    "test": "jest",
    "test:dry": "schematics .:my-schematic --dry-run",
    "package": "npm pack"
  }
}
```

Esta plantilla está diseñada para funcionar con GitHub Copilot para generar código de alta calidad para esquemáticos Angular.

---

## Anatomía de un Buen Esquemático

Un esquemático efectivo sigue estos principios:

1. **Enfoque específico**: Resuelve un problema concreto y bien definido
2. **Configurabilidad**: Ofrece opciones para personalizar su comportamiento
3. **Detección inteligente**: Identifica correctamente patrones en el código
4. **Transformación precisa**: Modifica sólo lo necesario, preservando el resto
5. **Robusto ante errores**: Maneja adecuadamente casos límite y situaciones inesperadas
6. **Bien documentado**: Incluye comentarios, logs y documentación clara

## Plantilla para index.ts

```typescript
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import {
  Project, SourceFile, Node, SyntaxKind,
  // Importa los tipos específicos que necesites
} from 'ts-morph';

export function miEsquematico(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // 1. Configuración inicial
    const base = options.path || 'src';
    const project = new Project({ useInMemoryFileSystem: true });
    
    // 2. Recolectar archivos
    const files = collectFiles(tree, base);
    context.logger.info(`Procesando ${files.length} archivos...`);
    
    // 3. Procesar cada archivo
    files.forEach((filePath) => {
      const fileContent = tree.read(filePath);
      if (!fileContent) return;
      
      // 4. Crear source file en memoria
      const sourceFile = project.createSourceFile(
        filePath, fileContent.toString(), { overwrite: true }
      );
      
      // 5. Transformar el archivo
      if (transformFile(sourceFile, options, context)) {
        // 6. Escribir cambios en el árbol
        tree.overwrite(filePath, sourceFile.getFullText());
        context.logger.info(`Archivo modificado: ${filePath}`);
      }
    });
    
    return tree;
  };
}

function collectFiles(tree: Tree, path: string): string[] {
  // Implementación para recolectar archivos recursivamente
}

function transformFile(
  sourceFile: SourceFile, 
  options: Schema,
  context: SchematicContext
): boolean {
  // Implementación para transformar un archivo
  // Retorna true si se hicieron cambios
}

// Funciones auxiliares específicas para tu transformación
```

## Ejemplo Completo: Esquemático para Reemplazo de HttpClient por ApiService

### Información General

- **Nombre del esquemático**: replace-http-client
- **Descripción**: Reemplaza el uso directo de HttpClient por un ApiService personalizado
- **Funcionalidad principal**: Transformar llamadas HttpClient a ApiService equivalentes
- **Tecnologías**: Angular, TypeScript, AST, ts-morph

### Código Antes:

```typescript
import { HttpClient } from '@angular/common/http';

@Component({...})
export class UserComponent {
  constructor(private http: HttpClient) {}
  
  getUsers() {
    return this.http.get('/api/users').pipe(
      map(users => users.filter(user => user.active))
    );
  }
  
  createUser(user: User) {
    return this.http.post('/api/users', user);
  }
}
```

### Código Después:

```typescript
import { ApiService } from '@core/services/api.service';

@Component({...})
export class UserComponent {
  constructor(private apiService: ApiService) {}
  
  getUsers() {
    return this.apiService.get('/api/users').pipe(
      map(users => users.filter(user => user.active))
    );
  }
  
  createUser(user: User) {
    return this.apiService.post('/api/users', user);
  }
}
```
