# Run Swagger on Port 5296
Write-Host "========================================" -ForegroundColor Green
Write-Host "    RUNNING SWAGGER ON PORT 5296" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Stop existing processes
Write-Host "`nStopping any existing processes..." -ForegroundColor Yellow
taskkill /F /IM PicXAPI.exe 2>$null
taskkill /F /IM dotnet.exe 2>$null

# Start backend
Write-Host "`nStarting Backend on port 5296..." -ForegroundColor Yellow
Set-Location "PicXAPI"
Start-Process -FilePath "dotnet" -ArgumentList "run", "--urls", "http://localhost:5296" -WindowStyle Hidden

# Wait for backend to start
Write-Host "`nWaiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Open Swagger
Write-Host "`nOpening Swagger..." -ForegroundColor Green
Start-Process "http://localhost:5296/swagger"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "    SWAGGER STATUS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5296" -ForegroundColor Cyan
Write-Host "Swagger:  http://localhost:5296/swagger" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

Read-Host "`nPress Enter to exit" 