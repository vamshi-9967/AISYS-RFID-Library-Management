Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting AISYS RFID Library Backend on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\..\backend"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
