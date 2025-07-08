# 🚀 Guía de Uso en Proyecto Angular Local

## ⚠️ Solución para el Error de Windows

Si obtienes el error: `Collection "C" cannot be resolved`, es porque Windows tiene problemas con las comillas en las rutas. Aquí están las soluciones:

## Método 1: Script Automático (Más Fácil) ⭐

### Paso 1: Copiar script
```bash
# Copia uno de estos archivos a la raíz de tu proyecto Angular:
copy "C:\Users\Usuario\schematic\ejecutar-schematic.bat" .
# O para PowerShell:
copy "C:\Users\Usuario\schematic\ejecutar-schematic.ps1" .
```

### Paso 2: Ejecutar
```bash
# Para Command Prompt:
ejecutar-schematic.bat

# Para PowerShell:
.\ejecutar-schematic.ps1 -DryRun    # Vista previa
.\ejecutar-schematic.ps1            # Aplicar cambios
```

## Método 2: Comando Manual (Corregido)

### Usa barras normales (/) en lugar de contrabarras (\):

```bash
# En tu proyecto Angular:
cd C:\ruta\a\tu\proyecto-angular

# Vista previa (IMPORTANTE: usar barras normales)
ng generate "C:/Users/Usuario/schematic/dist":add-takeuntil --dry-run

# Aplicar cambios
ng generate "C:/Users/Usuario/schematic/dist":add-takeuntil
```

## Método 2: Instalar como Paquete Local

### Paso 1: Crear paquete
```bash
# En la carpeta del schematic
cd c:\Users\Usuario\schematic
npm pack
# Esto crea: ng-add-takeuntil-1.0.0.tgz
```

### Paso 2: Instalar en tu proyecto
```bash
# En tu proyecto Angular
cd C:\ruta\a\tu\proyecto-angular
npm install c:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz
```

### Paso 3: Usar como schematic instalado
```bash
# Vista previa
ng generate ng-add-takeuntil:add-takeuntil --dry-run

# Aplicar
ng generate ng-add-takeuntil:add-takeuntil
```

## Método 3: Copia Manual

### Paso 1: Copiar archivos compilados
```bash
# Copiar la carpeta dist a tu proyecto Angular
xcopy c:\Users\Usuario\schematic\dist C:\ruta\a\tu\proyecto-angular\schematics\add-takeuntil /S /E
```

### Paso 2: Ejecutar desde el proyecto
```bash
# En tu proyecto Angular
ng generate ./schematics/add-takeuntil:add-takeuntil
```

## 📋 Opciones Disponibles

```bash
# Opciones del schematic
ng generate [ruta]:add-takeuntil [opciones]

--path=<ruta>        # Carpeta específica (default: src)
--project=<nombre>   # Proyecto específico en workspace
--skip-import        # No agregar imports automáticamente
--dry-run           # Solo mostrar cambios, no aplicar
```

## 🧪 Ejemplo Completo

```bash
# 1. Compilar schematic
cd c:\Users\Usuario\schematic
npm run build

# 2. Ir a tu proyecto Angular
cd C:\mi-proyecto-angular

# 3. Vista previa de cambios
ng generate "c:\Users\Usuario\schematic\dist":add-takeuntil --dry-run

# 4. Si todo se ve bien, aplicar cambios
ng generate "c:\Users\Usuario\schematic\dist":add-takeuntil

# 5. Verificar que los cambios son correctos
git diff
```

## 🔍 Qué Buscar Después

El schematic habrá:
- ✅ Agregado `private destroy$ = new Subject<void>();` a clases con suscripciones
- ✅ Implementado `OnDestroy` interface donde faltaba
- ✅ Creado o mejorado métodos `ngOnDestroy()`
- ✅ Envuelto suscripciones con `pipe(takeUntil(this.destroy$))`
- ✅ Agregado imports necesarios (`Subject`, `takeUntil`, `OnDestroy`)
- ✅ Respetado código que ya maneja suscripciones correctamente

## ⚠️ Antes de Usar

1. **Haz backup** de tu proyecto o usa control de versiones
2. **Prueba primero** con `--dry-run` para ver qué cambios hará
3. **Revisa los cambios** después de aplicar el schematic
4. **Compila tu proyecto** para verificar que no hay errores TypeScript
