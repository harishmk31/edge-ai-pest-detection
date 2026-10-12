# AgriVision AI — Development Server Launcher
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         AgriVision AI - Development Launcher" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend FastAPI Server
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$BackendCmd = "cd '$RootPath\backend'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCmd

Start-Sleep -Seconds 2

# 2. Start Frontend Vite Server
Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
$FrontendCmd = "cd '$RootPath\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host "`nAgriVision AI servers have been launched in separate terminal windows." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Interactive Swagger Docs: http://127.0.0.1:8000/docs`n" -ForegroundColor Yellow
