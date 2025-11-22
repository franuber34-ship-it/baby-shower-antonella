# Script para subir cambios a GitHub rápidamente
# Uso: .\subir-cambios.ps1 "mensaje del commit"

param(
    [string]$mensaje = "Actualización de la invitación"
)

Write-Host "📦 Agregando archivos..." -ForegroundColor Cyan
git add .

Write-Host "💾 Guardando cambios..." -ForegroundColor Yellow
git commit -m $mensaje

Write-Host "🚀 Subiendo a GitHub..." -ForegroundColor Green
git push

Write-Host "✅ ¡Cambios publicados!" -ForegroundColor Green
Write-Host "⏳ GitHub Pages se actualizará en 1-2 minutos" -ForegroundColor Yellow
Write-Host "🌐 URL: https://franuber34-ship-it.github.io/baby-shower-antonella/" -ForegroundColor Cyan
