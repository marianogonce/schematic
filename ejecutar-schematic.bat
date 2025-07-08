@echo off
chcp 65001 >nul
echo 🚀 Ejecutando ng-add-takeuntil schematic...
echo.

REM Verificar que estamos en un proyecto Angular
if not exist "angular.json" (
    echo ❌ Error: No se encontro angular.json
    echo Este script debe ejecutarse desde la raiz de un proyecto Angular
    pause
    exit /b 1
)

REM Verificar que el schematic existe
if not exist "C:\Users\Usuario\schematic\dist\collection.json" (
    echo ❌ Error: No se encontro el schematic compilado
    echo Ejecuta 'npm run build' en C:\Users\Usuario\schematic primero
    pause
    exit /b 1
)

echo 📋 Selecciona una opcion:
echo 1. Vista previa (dry-run) - recomendado
echo 2. Aplicar cambios directamente
echo.
set /p option="Ingresa 1 o 2: "

if "%option%"=="1" (
    echo.
    echo 🔍 Ejecutando vista previa...
    echo Comando: ng generate C:/Users/Usuario/schematic/dist:add-takeuntil --dry-run
    ng generate C:/Users/Usuario/schematic/dist:add-takeuntil --dry-run
) else if "%option%"=="2" (
    echo.
    echo ⚠️ Estas seguro? Esto modificara tus archivos
    set /p confirm="Escribe 'SI' para continuar: "
    if /i "%confirm%"=="SI" (
        echo.
        echo 🛠️ Aplicando cambios...
        echo Comando: ng generate C:/Users/Usuario/schematic/dist:add-takeuntil
        ng generate C:/Users/Usuario/schematic/dist:add-takeuntil
        echo.
        echo ✅ Cambios aplicados. Revisa los archivos modificados.
    ) else (
        echo Operacion cancelada.
    )
) else (
    echo Opcion invalida.
)

echo.
pause
