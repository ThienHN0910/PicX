@echo off
echo ========================================
echo    RUNNING SWAGGER ON PORT 5296
echo ========================================

echo.
echo Stopping any existing processes...
taskkill /F /IM PicXAPI.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul

echo.
echo Starting Backend on port 5296...
cd PicXAPI
start "PicX Backend" cmd /k "dotnet run --urls http://localhost:5296"

echo.
echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Opening Swagger...
start http://localhost:5296/swagger

echo.
echo ========================================
echo    SWAGGER STATUS
echo ========================================
echo Backend:  http://localhost:5296
echo Swagger:  http://localhost:5296/swagger
echo ========================================
echo.
echo Backend is running in a separate window.
echo Swagger should open in your browser.
echo.
pause 