# Start Backend on Port 5296
Write-Host "========================================" -ForegroundColor Green
Write-Host "    STARTING BACKEND ON PORT 5296" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nCurrent directory: $(Get-Location)" -ForegroundColor Cyan

# Stop existing processes
Write-Host "`nStopping any existing processes..." -ForegroundColor Yellow
taskkill /F /IM PicXAPI.exe 2>$null
taskkill /F /IM dotnet.exe 2>$null

# Build project
Write-Host "`nBuilding project..." -ForegroundColor Yellow
dotnet clean
$buildResult = dotnet build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nStarting backend on port 5296..." -ForegroundColor Green
dotnet run --urls "http://localhost:5296"

Write-Host "`nBackend stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit" 