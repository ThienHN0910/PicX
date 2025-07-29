# Quick Start Script for PicX
Write-Host "Starting PicX Backend and Frontend..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Set-Location "PicXAPI"
Start-Process -FilePath "dotnet" -ArgumentList "run" -WindowStyle Hidden

# Wait for backend
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Open Swagger
Write-Host "Opening Swagger..." -ForegroundColor Green
Start-Process "http://localhost:5296/swagger"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Set-Location "ClientApp"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# Wait for frontend
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open Frontend
Write-Host "Opening Frontend..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n=== APPLICATIONS STARTED ===" -ForegroundColor Green
Write-Host "Swagger:  http://localhost:5296/swagger" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Green 