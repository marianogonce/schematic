# Prompt para Generar Esquemático add-takeUntil

## Objetivo del Esquemático

Quiero crear un esquemático Angular que automatice la implementación del patrón takeUntil para gestionar correctamente las suscripciones RxJS en aplicaciones Angular, evitando memory leaks. El esquemático debe analizar clases Angular, detectar suscripciones y aplicar el patrón takeUntil de forma inteligente.

## Especificaciones Técnicas

### 1. Información General

- **Nombre del esquemático**: add-takeuntil
- **Descripción**: Añade el patrón takeUntil a suscripciones RxJS en componentes, directivas e inyectables de Angular
- **Funcionalidad principal**: Detección y transformación automática de suscripciones sin gestión de cancelación
- **Tecnologías**: Angular, TypeScript, AST, ts-morph

### 2. Transformación a Implementar

El esquemático debe:

- **Detectar** todas las suscripciones RxJS (llamadas a `.subscribe()`) en clases Angular
- **Verificar** si ya están gestionadas con algún mecanismo de cancelación
- **Añadir** un Subject de destrucción (destroy$) si no existe uno
- **Implementar** o actualizar el método ngOnDestroy para completar el Subject
- **Modificar** cada suscripción añadiendo `.pipe(takeUntil(this.destroy$))`
- **Añadir** los imports necesarios (Subject, takeUntil, OnDestroy)

### 3. Implementación Detallada

#### Detección Inteligente

El esquemático debe ser capaz de:

- Reconocer clases con decoradores Angular (@Component, @Directive, @Injectable)
- Detectar llamadas a `.subscribe()` en estas clases
- Identificar si ya existe algún Subject para cancelación (con nombres como destroy$, dispose$, unsubscribe$, etc.)
- Detectar si ya existe un método ngOnDestroy y qué hace

#### Transformación Segura

- Añadir un Subject privado (si no existe): `private destroy$ = new Subject<void>();`
- Implementar OnDestroy (si no existe): `implements OnDestroy`
- Añadir/actualizar método ngOnDestroy:
  ```typescript
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ```
- Para cada llamada a subscribe:
  - Si ya tiene pipe: `observable.pipe(operadores, takeUntil(this.destroy$))`
  - Si no tiene pipe: `observable.pipe(takeUntil(this.destroy$)).subscribe(...)`

### 4. Opciones del Esquemático

- **path**: Ruta donde aplicar la transformación (default: "src")
- **project**: Nombre del proyecto Angular
- **skipImport**: Omitir añadir imports (default: false)
- **dryRun**: Ejecutar sin hacer cambios (default: false)

### 5. Manejo de Casos Especiales

- **Pipes existentes**: Si el observable ya tiene un método `.pipe()`, añadir takeUntil como último operador
- **Subscripciones múltiples**: Procesar todas las suscripciones en una clase
- **NgOnDestroy existente**: Preservar el código existente y añadir solo lo necesario
- **Sujetos existentes**: Detectar y reutilizar sujetos con nombres variados (destroy$, unsubscribe$, etc.)
- **Prevenir duplicados**: No añadir takeUntil si ya existe

## Ejemplos de Transformación

### Caso Simple - Antes:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: ''
})
export class ExampleComponent {
  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    this.dataService.getData().subscribe(data => {
      console.log(data);
    });
  }
}
```

### Caso Simple - Después:

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-example',
  template: ''
})
export class ExampleComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log(data);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Caso con Pipe Existente - Antes:

```typescript
import { Component } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-complex',
  template: ''
})
export class ComplexComponent {
  loadData() {
    this.http.get('/api/data').pipe(
      map(response => response.items),
      filter(items => items.length > 0)
    ).subscribe(items => {
      this.items = items;
    });
  }
}
```

### Caso con Pipe Existente - Después:

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-complex',
  template: ''
})
export class ComplexComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  loadData() {
    this.http.get('/api/data').pipe(
      map(response => response.items),
      filter(items => items.length > 0),
      takeUntil(this.destroy$)
    ).subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Caso con OnDestroy Existente - Antes:

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-with-destroy',
  template: ''
})
export class WithDestroyComponent implements OnDestroy {
  private subscription: Subscription;
  
  ngOnInit() {
    this.subscription = this.service.getData().subscribe(data => {
      this.data = data;
    });
  }

  ngOnDestroy(): void {
    // Limpiar otros recursos
    this.cleanupResources();
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  private cleanupResources() {
    // Código de limpieza existente
  }
}
```

### Caso con OnDestroy Existente - Después:

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-with-destroy',
  template: ''
})
export class WithDestroyComponent implements OnDestroy {
  private subscription: Subscription;
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }

  ngOnDestroy(): void {
    // Limpiar otros recursos
    this.cleanupResources();
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private cleanupResources() {
    // Código de limpieza existente
  }
}
```

## Estructura de Archivos a Generar

Por favor, genera el código completo para los siguientes archivos:

1. **src/collection.json**: Define el esquemático add-takeuntil
2. **src/add-takeuntil/schema.json**: Define las opciones del esquemático
3. **src/add-takeuntil/schema.ts**: Define la interfaz TypeScript para las opciones
4. **src/add-takeuntil/index.ts**: Implementa el esquemático usando ts-morph con:
   - Función para recopilar archivos TypeScript recursivamente
   - Función para detectar clases Angular 
   - Función para detectar y reutilizar Subjects de destrucción existentes
   - Función para sincronizar el método ngOnDestroy
   - Función para transformar llamadas subscribe
   - Función para gestionar imports
   - Sistema de logging para mostrar operaciones realizadas

## Consideraciones Técnicas Específicas

1. **Rendimiento**: El esquemático debe ser eficiente incluso en proyectos grandes
2. **Robustez**: Manejar adecuadamente casos límite y estructuras de código complejas
3. **No-duplicación**: No añadir código duplicado si ya existe una implementación
4. **Preservación**: Mantener el formato, comentarios y estilo del código original
5. **Detección contextual**: Analizar el contexto completo de cada clase para tomar decisiones inteligentes

## Testing del Esquemático

Incluir recomendaciones para probar el esquemático:

- Comando para ejecutar en modo dry-run
- Archivos de test para verificar transformaciones
- Ejemplos de casos límite para validación

## Documentación del Esquemático

El esquemático debe incluir:

- README.md con instrucciones de uso
- Ejemplos de código antes/después
- Documentación sobre opciones y comportamientos
- Instrucciones para situaciones especiales
