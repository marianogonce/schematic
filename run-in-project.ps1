param(
    [switch]$DryRun,
    [string]$ProjectPath = $PWD
)

Write-Host "🚀 Running ng-add-takeuntil schematic..." -ForegroundColor Green

# Change to project directory
Set-Location $ProjectPath

# Verify it's an Angular project
if (-not (Test-Path "angular.json")) {
    Write-Host "❌ Error: angular.json not found" -ForegroundColor Red
    Write-Host "Make sure you're in an Angular project root" -ForegroundColor Red
    exit 1
}

# Build the command
$schematicPath = "C:/Users/Usuario/schematic/dist"

if ($DryRun) {
    Write-Host "🔍 Running dry-run preview..." -ForegroundColor Yellow
    ng generate $schematicPath`:add-takeuntil --dry-run
} else {
    Write-Host "🛠️ Applying changes..." -ForegroundColor Yellow
    ng generate $schematicPath`:add-takeuntil
}

Write-Host "✅ Done!" -ForegroundColor Green
