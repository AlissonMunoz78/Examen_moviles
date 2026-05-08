# build-apk.ps1
# Script para regenerar APK después de los fixes
# Uso: .\build-apk.ps1

param(
    [switch]$Clean = $false,
    [switch]$Local = $false
)

Write-Host "🔨 GastroMap APK Builder" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Validar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "   Ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Paso 2: Limpiar si se especifica
if ($Clean) {
    Write-Host "🧹 Limpiando cache y dependencias..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
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

# Paso 4: Validar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Advertencia: No se encontró .env" -ForegroundColor Yellow
    Write-Host "   Las credenciales de Supabase no estarán disponibles" -ForegroundColor Yellow
}

# Paso 5: Build APK
Write-Host "🏗️  Construyendo APK..." -ForegroundColor Yellow

if ($Local) {
    Write-Host "   Modo: BUILD LOCAL" -ForegroundColor Cyan
    eas build -p android --profile preview --local
}
else {
    Write-Host "   Modo: EAS BUILD (nube)" -ForegroundColor Cyan
    eas build -p android --profile preview
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ APK construcción completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Siguientes pasos:" -ForegroundColor Cyan
Write-Host "   1. Descarga la APK desde: https://expo.dev/builds" -ForegroundColor White
Write-Host "   2. Instala en tu dispositivo: adb install -r app.apk" -ForegroundColor White
Write-Host "   3. Abre la app y verifica que no haya pantalla blanca" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para testear en emulador primero:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host "   npm run android" -ForegroundColor White
