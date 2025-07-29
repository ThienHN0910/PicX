# Fix and Run PicX Project
Write-Host "========================================" -ForegroundColor Green
Write-Host "    FIXING AND RUNNING PICX PROJECT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nCurrent directory: $(Get-Location)" -ForegroundColor Cyan

# Stop existing processes
Write-Host "`nStopping any existing processes..." -ForegroundColor Yellow
taskkill /F /IM PicXAPI.exe 2>$null
taskkill /F /IM node.exe 2>$null

# Check if we're in the right directory
Write-Host "`nChecking if we're in the right directory..." -ForegroundColor Yellow
if (Test-Path "PicXAPI.csproj") {
    Write-Host "Found PicXAPI.csproj - we're in the right place!" -ForegroundColor Green
} elseif (Test-Path "PicXAPI\PicXAPI.csproj") {
    Write-Host "Found PicXAPI.csproj in PicXAPI folder" -ForegroundColor Green
    Set-Location "PicXAPI"
} else {
    Write-Host "ERROR: Cannot find PicXAPI.csproj" -ForegroundColor Red
    Write-Host "Please run this script from the PicX root directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nBuilding and running Backend..." -ForegroundColor Yellow
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Clean and build backend
dotnet clean
$buildResult = dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nStarting Backend..." -ForegroundColor Yellow
Start-Process -FilePath "dotnet" -ArgumentList "run" -WindowStyle Hidden

Write-Host "`nWaiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`nOpening Swagger..." -ForegroundColor Green
Start-Process "http://localhost:5296/swagger"

# Start frontend
Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
if (Test-Path "ClientApp\package.json") {
    Set-Location "ClientApp"
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    
    Write-Host "`nWaiting for frontend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "`nOpening Frontend..." -ForegroundColor Green
    Start-Process "http://localhost:5173"
} else {
    Write-Host "WARNING: ClientApp not found in current directory" -ForegroundColor Yellow
    Write-Host "Frontend will not be started" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "    PROJECT STATUS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5296" -ForegroundColor Cyan
Write-Host "Swagger:  http://localhost:5296/swagger" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

Read-Host "`nPress Enter to exit" 