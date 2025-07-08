param(
    [switch]$DryRun,
    [string]$Path = "src"
)

Write-Host "🚀 Ejecutando ng-add-takeuntil schematic..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en un proyecto Angular
if (-not (Test-Path "angular.json")) {
    Write-Host "❌ Error: No se encontró angular.json" -ForegroundColor Red
    Write-Host "Este script debe ejecutarse desde la raíz de un proyecto Angular" -ForegroundColor Red
    exit 1
}

# Verificar que el schematic existe
$schematicPath = "C:\Users\Usuario\schematic\dist\collection.json"
if (-not (Test-Path $schematicPath)) {
    Write-Host "❌ Error: No se encontró el schematic compilado" -ForegroundColor Red
    Write-Host "Ejecuta 'npm run build' en C:\Users\Usuario\schematic primero" -ForegroundColor Red
    exit 1
}

# Construir el comando
$schematicCollection = "C:/Users/Usuario/schematic/dist"
$command = "ng generate `"$schematicCollection`":add-takeuntil"

if ($Path -ne "src") {
    $command += " --path=$Path"
}

if ($DryRun) {
    $command += " --dry-run"
    Write-Host "🔍 Ejecutando vista previa..." -ForegroundColor Yellow
} else {
    Write-Host "🛠️  Aplicando cambios..." -ForegroundColor Yellow
}

Write-Host "Comando: $command" -ForegroundColor Cyan
Write-Host ""

# Ejecutar el comando
try {
    Invoke-Expression $command
    
    if ($DryRun) {
        Write-Host ""
        Write-Host "✅ Vista previa completada. Si todo se ve bien, ejecuta sin -DryRun" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✅ Cambios aplicados. Revisa los archivos modificados." -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error ejecutando el schematic: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Uso:"
Write-Host "  .\ejecutar-schematic.ps1 -DryRun          # Vista previa"
Write-Host "  .\ejecutar-schematic.ps1                  # Aplicar cambios"
Write-Host "  .\ejecutar-schematic.ps1 -Path src/app    # Carpeta específica"
