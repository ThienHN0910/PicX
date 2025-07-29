@echo off
echo ========================================
echo    PICX PROJECT - BUILD AND RUN
echo ========================================

echo.
echo Stopping existing processes...
taskkill /F /IM PicXAPI.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo Building and starting Backend...
cd PicXAPI
start "PicX Backend" cmd /k "dotnet clean && dotnet build && dotnet run"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo Installing and starting Frontend...
cd ClientApp
start "PicX Frontend" cmd /k "npm install && npm run dev"

echo.
echo Waiting for frontend to start...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo    PROJECT STATUS
echo ========================================
echo Backend:  http://localhost:5296
echo Frontend: http://localhost:5173
echo Swagger:  http://localhost:5296/swagger
echo ========================================
echo.
echo Both applications are starting...
echo Check the opened command windows for status.
echo.
pause 