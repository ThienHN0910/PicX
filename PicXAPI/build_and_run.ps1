# Build và chạy Backend
Write-Host "Building PicX Backend..." -ForegroundColor Green
dotnet clean
dotnet build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful! Starting backend..." -ForegroundColor Green
    dotnet run
} else {
    Write-Host "Build failed!" -ForegroundColor Red
} 