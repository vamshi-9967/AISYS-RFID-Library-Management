Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting AISYS RFID Library Frontend on http://localhost:5173" -ForegroundColor Green
Write-Host "Proxy: /api -> http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\..\frontend"
npm run dev
