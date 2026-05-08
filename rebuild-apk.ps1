#!/usr/bin/env pwsh
# rebuild-apk.ps1
# Script para regenerar APK después del fix del error "FAILED TO download remote update"
# Uso: .\rebuild-apk.ps1

param(
    [switch]$Clean = $false,
    [switch]$Local = $false,
    [switch]$Verbose = $false
)

Write-Host "🔨 GastroMap APK Rebuild — Fix Download Error" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Validar ubicación
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json no encontrado" -ForegroundColor Red
    Write-Host "   Ejecuta desde: c:\Users\David\Desktop\AA\Examen_moviles" -ForegroundColor Yellow
    exit 1
}

Write-Host "📍 Ubicación: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Paso 1: Validar cambios de configuración
Write-Host "✓ Validando cambios en app.json..." -ForegroundColor Yellow
$appJsonContent = Get-Content "app.json" -Raw
if ($appJsonContent -match '"enabled":\s*false') {
    Write-Host "  ✓ Updates deshabilitados en app.json" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Updates podría no estar deshabilitado" -ForegroundColor Yellow
}

Write-Host "✓ Validando cambios en eas.json..." -ForegroundColor Yellow
$easJsonContent = Get-Content "eas.json" -Raw
if ($easJsonContent -match '"updates".*"enabled":\s*false') {
    Write-Host "  ✓ Updates deshabilitados en eas.json" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Updates podría no estar deshabilitado en eas.json" -ForegroundColor Yellow
}

Write-Host ""

# Paso 2: Limpiar si se solicita
if ($Clean) {
    Write-Host "🧹 Limpiando cache y dependencias..." -ForegroundColor Yellow
    
    if (Test-Path "node_modules") {
        Write-Host "   Removiendo node_modules..." -ForegroundColor Gray
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path ".expo") {
        Write-Host "   Removiendo .expo..." -ForegroundColor Gray
        Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-Host "   Removiendo package-lock.json..." -ForegroundColor Gray
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "✓ Cache limpiado" -ForegroundColor Green
    Write-Host ""
}

# Paso 3: Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en npm install" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# Paso 4: Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  ADVERTENCIA: No se encontró .env" -ForegroundColor Yellow
    Write-Host "   Las credenciales de Supabase no estarán disponibles" -ForegroundColor Yellow
    Write-Host ""
}

# Paso 5: Build APK
Write-Host "🏗️  Construyendo APK..." -ForegroundColor Yellow

$buildArgs = @("build", "-p", "android", "--profile", "preview")

if ($Local) {
    Write-Host "   Modo: BUILD LOCAL (más rápido)" -ForegroundColor Cyan
    $buildArgs += "--local"
} else {
    Write-Host "   Modo: EAS BUILD (nube — recomendado)" -ForegroundColor Cyan
}

if ($Verbose) {
    Write-Host "   Logs: VERBOSE" -ForegroundColor Cyan
    $buildArgs += "--verbose"
}

Write-Host "   Comando: eas $($buildArgs -join ' ')" -ForegroundColor Gray
Write-Host ""

# Ejecutar build
& eas @buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build de EAS" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ APK construction completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Siguientes pasos:" -ForegroundColor Cyan
Write-Host "   1. Descarga el APK desde: https://expo.dev/builds" -ForegroundColor White
Write-Host "   2. Instala en tu dispositivo:" -ForegroundColor White
Write-Host "      adb install -r ./app.apk" -ForegroundColor Gray
Write-Host "   3. Abre la app y verifica que:" -ForegroundColor White
Write-Host "      ✓ Se abre sin error 'FAILED TO download'" -ForegroundColor Gray
Write-Host "      ✓ Se ve pantalla de Login" -ForegroundColor Gray
Write-Host "      ✓ Icono tiene colores (no blanco)" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Para testear en emulador primero:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host "   npm run android" -ForegroundColor White
Write-Host ""
