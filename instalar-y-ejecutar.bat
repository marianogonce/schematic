@echo off
chcp 65001 >nul
echo 🚀 Instalando ng-add-takeuntil en el proyecto actual...
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
    echo Ejecutando npm run package:local...
    cd /d "C:\Users\Usuario\schematic"
    call npm run package:local
    cd /d "%~dp0"
)

echo 📦 Instalando paquete npm (compatible con Angular 10+)...
npm install "C:\Users\Usuario\schematic\ng-add-takeuntil-1.0.0.tgz" --save-dev --legacy-peer-deps

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
    call ng generate ng-add-takeuntil:add-takeuntil --dry-run
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Vista previa completada exitosamente!
        echo 💡 Si todo se ve bien, ejecuta de nuevo y selecciona opcion 2
    )
) else if "%option%"=="2" (
    echo.
    echo ⚠️ Estas seguro? Esto modificara tus archivos
    set /p confirm="Escribe 'SI' para continuar: "
    if /i "%confirm%"=="SI" (
        echo.
        echo 🛠️ Aplicando cambios...
        call ng generate ng-add-takeuntil:add-takeuntil
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ✅ Cambios aplicados exitosamente!
            echo 📝 Revisa los archivos modificados con: git diff
            echo.
            echo 🧹 ¿Desinstalar el paquete temporal? (Y/N)
            set /p cleanup="Escribe 'Y' para desinstalar: "
            if /i "%cleanup%"=="Y" (
                npm uninstall ng-add-takeuntil
                echo ✅ Paquete desinstalado
            )
        )
    ) else (
        echo Operacion cancelada.
    )
) else (
    echo Opcion invalida.
)

echo.
pause
