@echo off
chcp 65001 >nul
echo 🚀 Instalando ng-add-takeuntil via npm pack...
echo.

REM Verificar que estamos en un proyecto Angular
if not exist "angular.json" (
    echo ❌ Error: No se encontro angular.json
    echo Este script debe ejecutarse desde la raiz de un proyecto Angular
    pause
    exit /b 1
)

REM Verificar que el paquete existe
if not exist "C:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz" (
    echo ❌ Error: No se encontro el paquete ng-add-takeuntil-1.0.0.tgz
    echo Ejecuta 'npm run package:local' en C:\Users\Usuario\schematic primero
    pause
    exit /b 1
)

echo 📦 Instalando paquete...
npm install "C:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando el paquete
    pause
    exit /b 1
)

echo ✅ Paquete instalado exitosamente!
echo.
echo 📋 Selecciona una opcion:
echo 1. Vista previa (dry-run) - recomendado
echo 2. Aplicar cambios directamente
echo.
set /p option="Ingresa 1 o 2: "

if "%option%"=="1" (
    echo.
    echo 🔍 Ejecutando vista previa...
    ng generate ng-add-takeuntil:add-takeuntil --dry-run
) else if "%option%"=="2" (
    echo.
    echo ⚠️ Estas seguro? Esto modificara tus archivos
    set /p confirm="Escribe 'SI' para continuar: "
    if /i "%confirm%"=="SI" (
        echo.
        echo 🛠️ Aplicando cambios...
        ng generate ng-add-takeuntil:add-takeuntil
        echo.
        echo ✅ Cambios aplicados. Revisa los archivos modificados.
    ) else (
        echo Operacion cancelada.
    )
) else (
    echo Opcion invalida.
)

echo.
echo 💡 Para desinstalar el schematic: npm uninstall ng-add-takeuntil
echo.
pause
