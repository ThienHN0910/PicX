@echo off
echo ========================================
echo    STARTING BACKEND ON PORT 5296
echo ========================================

echo.
echo Current directory: %CD%
echo.

echo Stopping any existing processes...
taskkill /F /IM PicXAPI.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul

echo.
echo Building project...
dotnet clean
dotnet build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Starting backend on port 5296...
dotnet run --urls "http://localhost:5296"

echo.
echo Backend stopped.
pause 