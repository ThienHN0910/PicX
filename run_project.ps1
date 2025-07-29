# Script để build và chạy dự án PicX
Write-Host "=== BUILDING AND RUNNING PICX PROJECT ===" -ForegroundColor Green

# Dừng các process đang chạy
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
taskkill /F /IM PicXAPI.exe 2>$null
taskkill /F /IM node.exe 2>$null

# Chuyển đến thư mục backend
Set-Location "PicXAPI"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Clean và build backend
Write-Host "Cleaning backend..." -ForegroundColor Yellow
dotnet clean

Write-Host "Building backend..." -ForegroundColor Yellow
dotnet build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend build successful!" -ForegroundColor Green
    
    # Chạy backend trong background
    Write-Host "Starting backend..." -ForegroundColor Yellow
    Start-Process -FilePath "dotnet" -ArgumentList "run" -WindowStyle Hidden
    
    # Đợi backend khởi động
    Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Kiểm tra backend
    $backendRunning = netstat -an | findstr ":5296"
    if ($backendRunning) {
        Write-Host "Backend is running on port 5296" -ForegroundColor Green
    } else {
        Write-Host "Backend failed to start" -ForegroundColor Red
    }
    
    # Chuyển đến thư mục frontend
    Set-Location "ClientApp"
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
    
    # Cài đặt dependencies frontend
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    
    # Chạy frontend trong background
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    
    # Đợi frontend khởi động
    Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Kiểm tra frontend
    $frontendRunning = netstat -an | findstr ":5173"
    if ($frontendRunning) {
        Write-Host "Frontend is running on port 5173" -ForegroundColor Green
    } else {
        Write-Host "Frontend failed to start" -ForegroundColor Red
    }
    
    Write-Host "`n=== PROJECT STATUS ===" -ForegroundColor Green
    Write-Host "Backend: http://localhost:5296" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Swagger: http://localhost:5296/swagger" -ForegroundColor Cyan
    
} else {
    Write-Host "Backend build failed!" -ForegroundColor Red
} 