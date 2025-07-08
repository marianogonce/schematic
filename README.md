# Angular TakeUntil Schematic

Este es un schematic de Angular **inteligente y avanzado** que automatiza la implementación del patrón `takeUntil` para la gestión de suscripciones RxJS en aplicaciones Angular, ayudando a prevenir memory leaks de manera eficiente.

## 🎉 Últimas Mejoras (v1.0.0)

### ✅ Bug Crítico Corregido
- **Problema resuelto**: Generación de código inválido en pipes RxJS complejos
- **Antes**: `switchMap((, takeUntil(this.destroy$))` ❌
- **Ahora**: `switchMap((response) => ...), takeUntil(this.destroy$)` ✅
- **Mejoras**: Parsing inteligente de paréntesis balanceados y manejo robusto de operadores anidados

## 🚀 Características Avanzadas

- ✅ **Detección inteligente**: Encuentra clases Angular (@Component, @Directive, @Injectable) con suscripciones RxJS
- ✅ **Análisis avanzado**: Detecta patrones existentes de gestión de suscripciones para evitar duplicados
- ✅ **Patrón destroy$**: Agrega automáticamente la propiedad `private destroy$ = new Subject<void>()`
- ✅ **Implementación OnDestroy**: Agrega o mejora el método `ngOnDestroy()` con las llamadas necesarias
- ✅ **TakeUntil automático**: Envuelve las suscripciones con `pipe(takeUntil(this.destroy$))`
- ✅ **Gestión de propiedades Subscription**: Maneja automáticamente propiedades de tipo `Subscription`
- ✅ **Detección de patrones HTTP**: Identifica suscripciones HTTP y de routing
- ✅ **Detección Async Pipe**: Respeta componentes que ya usan async pipe
- ✅ **Gestión de imports**: Agrega automáticamente los imports necesarios de RxJS
- ✅ **Preserva código existente**: No modifica código que ya maneja correctamente las suscripciones
- ✅ **Logging inteligente**: Informa qué clases procesa y cuáles omite

## 📦 Instalación

```bash
npm install ng-add-takeuntil
```

## 🎯 Uso

### Como Angular Schematic

```bash
# Aplicar a todo el proyecto (carpeta src)
ng generate ng-add-takeuntil:add-takeuntil

# Aplicar a una ruta específica
ng generate ng-add-takeuntil:add-takeuntil --path=src/app/components

# Vista previa (dry-run)
ng generate ng-add-takeuntil:add-takeuntil --dry-run
```

### Desarrollo

```bash
# Compilar el schematic
npm run build

# Probar el schematic
npm test

# Limpiar archivos compilados
npm run clean
```

## Ejemplo de Transformación

### Antes

```typescript
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

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
    
    this.dataService.getOtherData().pipe(
      map(x => x.value)
    ).subscribe(value => {
      console.log(value);
    });
  }
}
```

### Después

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-example',
  template: ''
})
export class ExampleComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    this.dataService.getData().pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log(data);
    });
    
    this.dataService.getOtherData().pipe(
      map(x => x.value),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      console.log(value);
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Comportamiento Inteligente

El schematic es lo suficientemente inteligente para:

1. **No duplicar código**: Si ya existe un `destroy$` o `ngOnDestroy()`, los mejora en lugar de duplicarlos
2. **Respetar pipes existentes**: Si una suscripción ya tiene `.pipe()`, agrega `takeUntil` como operador adicional
3. **Verificar imports**: Solo agrega imports que no existen
4. **Ignorar archivos sin suscripciones**: No modifica clases que no tienen `.subscribe()`
5. **Preservar formato**: Mantiene el estilo de código existente

## Opciones del Schema

- `path`: Ruta donde aplicar la transformación (default: "src")
- `project`: Nombre del proyecto Angular específico
- `skipImport`: Omitir agregar imports automáticamente
- `dryRun`: Ejecutar sin hacer cambios (solo mostrar lo que haría)

## Requisitos

- Angular 14+
- TypeScript 4.7+
- RxJS 6+

## Licencia

MIT

## 📋 Casos de Uso Avanzados

### Caso 1: Múltiples Suscripciones con Pipes Complejos

**Antes:**
```typescript
@Component({...})
export class ComplexComponent implements OnInit {
  constructor(private http: HttpClient, private route: ActivatedRoute) {}
  
  ngOnInit() {
    // HTTP con operadores complejos
    this.http.get('/api/data').pipe(
      map(data => data.items),
      filter(items => items.length > 0),
      debounceTime(300)
    ).subscribe(items => {
      this.processItems(items);
    });
    
    // Route params
    this.route.params.subscribe(params => {
      this.loadData(params.id);
    });
    
    // Timer
    timer(5000).subscribe(() => {
      this.autoSave();
    });
  }
}
```

**Después:**
```typescript
@Component({...})
export class ComplexComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private route: ActivatedRoute) {}
  
  ngOnInit() {
    // HTTP con operadores complejos + takeUntil
    this.http.get('/api/data').pipe(
      map(data => data.items),
      filter(items => items.length > 0),
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(items => {
      this.processItems(items);
    });
    
    // Route params + takeUntil
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.loadData(params.id);
    });
    
    // Timer + takeUntil
    timer(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.autoSave();
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Caso 2: Propiedades Subscription

**Antes:**
```typescript
@Component({...})
export class SubscriptionComponent {
  private dataSubscription: Subscription;
  private timerSubscription: Subscription;
  
  loadData() {
    this.dataSubscription = this.service.getData().subscribe(data => {
      console.log(data);
    });
    
    this.timerSubscription = interval(1000).subscribe(val => {
      console.log(val);
    });
  }
}
```

**Después:**
```typescript
@Component({...})
export class SubscriptionComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private dataSubscription: Subscription;
  private timerSubscription: Subscription;
  
  loadData() {
    this.dataSubscription = this.service.getData().pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log(data);
    });
    
    this.timerSubscription = interval(1000).pipe(takeUntil(this.destroy$)).subscribe(val => {
      console.log(val);
    });
  }
  
  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Caso 3: Código que NO se modifica (ya está bien)

```typescript
// ❌ NO se modifica - ya usa async pipe
@Component({
  template: '<div>{{ data$ | async }}</div>'
})
export class AsyncPipeComponent {
  data$ = this.service.getData(); // ✅ Correcto con async pipe
}

// ❌ NO se modifica - ya tiene gestión manual
@Component({...})
export class ManualManagementComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  
  ngOnInit() {
    const sub = this.service.getData().subscribe(data => {
      // handle data
    });
    this.subscriptions.push(sub);
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe()); // ✅ Ya está bien
  }
}
```

## 🧠 Inteligencia del Schematic

### Detección Avanzada de Patrones

El schematic es lo suficientemente inteligente para:

1. **✅ Analizar el contexto completo**:
   - Detecta si ya existe un patrón de destrucción válido
   - Identifica diferentes tipos de suscripciones (HTTP, routing, timers, etc.)
   - Reconoce componentes que usan async pipe extensivamente

2. **✅ Evitar modificaciones innecesarias**:
   - No toca código que ya maneja suscripciones correctamente
   - Respeta patrones existentes como arrays de subscriptions
   - Preserva el uso de async pipe

3. **✅ Manejar casos complejos**:
   - Propiedades de tipo `Subscription`
   - Pipes existentes con múltiples operadores
   - Métodos `ngOnDestroy` que ya existen

4. **✅ Logging inteligente**:
   ```
   Processing class: TestComponent
   Skipping class GoodComponent: already has proper subscription management
   ```

### Estadísticas del Código

- **457 líneas** de código TypeScript
- **21 funciones** especializadas
- **Detección de patrones** avanzada
- **Tamaño optimizado**: 16KB

## 🛠️ Desarrollo y Testing

```bash
# Testing completo
npm test

# Solo compilar
npm run build

# Dry run en un proyecto
npm run test:dry

# Limpiar archivos compilados
npm run clean
```

## 🎯 Casos de Uso Detectados Automáticamente

| Patrón | Detección | Acción |
|--------|-----------|--------|
| `component.subscribe()` | ✅ | Agrega `takeUntil` |
| `| async` en template | ✅ | **No modifica** |
| `subscription.unsubscribe()` | ✅ | **No modifica** |
| `destroy$.next()` existente | ✅ | **No modifica** |
| Propiedades `Subscription` | ✅ | Agrega `unsubscribe()` |
| HTTP subscriptions | ✅ | Agrega `takeUntil` |
| Route subscriptions | ✅ | Agrega `takeUntil` |
| Timer/Interval | ✅ | Agrega `takeUntil` |
