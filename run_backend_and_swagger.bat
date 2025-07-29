@echo off
echo ========================================
echo    RUNNING BACKEND AND OPENING SWAGGER
echo ========================================

echo.
echo Stopping any existing processes...
taskkill /F /IM PicXAPI.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul

echo.
echo Starting Backend...
cd PicXAPI
start "PicX Backend" cmd /k "dotnet run --urls http://localhost:5000"

echo.
echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Opening Swagger...
start http://localhost:5000/swagger

echo.
echo ========================================
echo    BACKEND AND SWAGGER STATUS
echo ========================================
echo Backend:  http://localhost:5000
echo Swagger:  http://localhost:5000/swagger
echo ========================================
echo.
echo Backend is running in a separate window.
echo Swagger should open in your browser.
echo.
pause 