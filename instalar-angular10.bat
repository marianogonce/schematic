@echo off
chcp 65001 >nul
echo 🚀 Instalando ng-add-takeuntil (Compatible con Angular 10+)...
echo.

REM Verificar que estamos en un proyecto Angular
if not exist "angular.json" (
    echo ❌ Error: No se encontro angular.json
    echo Este script debe ejecutarse desde la raiz de un proyecto Angular
    pause
    exit /b 1
)

REM Detectar version de Angular
echo 🔍 Detectando version de Angular...
findstr "@angular/core" package.json > temp_version.txt
set /p angular_version=<temp_version.txt
del temp_version.txt
echo Version detectada: %angular_version%

REM Verificar que el paquete existe y recrearlo si es necesario
if not exist "C:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz" (
    echo 📦 Creando paquete compatible...
    cd /d "C:\Users\Usuario\schematic"
    call npm run package:local
    cd /d "%~dp0"
)

echo 📦 Instalando paquete npm con compatibilidad forzada...
echo ⚠️ Usando --legacy-peer-deps para resolver conflictos de dependencias
npm install "C:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz" --save-dev --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error con --legacy-peer-deps, intentando con --force...
    npm install "C:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz" --save-dev --force
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Error instalando el paquete
        echo 💡 Esto puede suceder si hay conflictos de dependencias
        echo 💡 El schematic funciona mejor con Angular 12+ pero es compatible con 10+
        echo.
        echo 🔧 Opciones:
        echo 1. Actualizar Angular a version mas reciente
        echo 2. Continuar con instalacion manual
        echo.
        set /p continue="¿Continuar con instalacion manual? (Y/N): "
        if /i "%continue%"=="Y" (
            goto manual_install
        ) else (
            pause
            exit /b 1
        )
    )
)

echo ✅ Paquete instalado exitosamente!
goto run_schematic

:manual_install
echo.
echo 📋 Instalacion Manual:
echo 1. Copia los archivos del schematic manualmente
echo 2. Ejecuta: ng generate ./path/to/schematic:add-takeuntil --dry-run
pause
exit /b 0

:run_schematic
echo.
echo 📋 Selecciona una opcion:
echo 1. Vista previa (dry-run) - recomendado
echo 2. Aplicar cambios directamente
echo.
set /p option="Ingresa 1 o 2: "

if "%option%"=="1" (
    echo.
    echo 🔍 Ejecutando vista previa...
    call ng generate ng-add-takeuntil:add-takeuntil --dry-run
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Vista previa completada exitosamente!
        echo 💡 Si todo se ve bien, ejecuta de nuevo y selecciona opcion 2
    ) else (
        echo.
        echo ❌ Error en vista previa
        echo 💡 Verifica que tu proyecto compile correctamente
    )
) else if "%option%"=="2" (
    echo.
    echo ⚠️ Estas seguro? Esto modificara tus archivos
    echo ⚠️ Asegurate de tener backup o control de versiones
    set /p confirm="Escribe 'SI' para continuar: "
    if /i "%confirm%"=="SI" (
        echo.
        echo 🛠️ Aplicando cambios...
        call ng generate ng-add-takeuntil:add-takeuntil
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ✅ Cambios aplicados exitosamente!
            echo 📝 Revisa los archivos modificados con: git diff
            echo 📝 Compila tu proyecto para verificar: ng build
            echo.
            echo 🧹 ¿Desinstalar el paquete temporal? (Y/N)
            set /p cleanup="Escribe 'Y' para desinstalar: "
            if /i "%cleanup%"=="Y" (
                npm uninstall ng-add-takeuntil
                echo ✅ Paquete desinstalado
            )
        ) else (
            echo.
            echo ❌ Error aplicando cambios
            echo 💡 Revisa los logs de Angular CLI para mas detalles
        )
    ) else (
        echo Operacion cancelada.
    )
) else (
    echo Opcion invalida.
)

echo.
echo 💡 Consejos post-instalacion:
echo - Compila tu proyecto: ng build
echo - Revisa los cambios: git diff
echo - Los imports RxJS pueden necesitar ajustes para Angular 10
echo.
pause
