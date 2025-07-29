@echo off
echo ========================================
echo    OPENING SWAGGER AND FRONTEND
echo ========================================

echo.
echo Starting Backend for Swagger...
cd PicXAPI
start "PicX Backend" cmd /k "dotnet run"

echo.
echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Opening Swagger in browser...
start http://localhost:5296/swagger

echo.
echo Starting Frontend...
cd ClientApp
start "PicX Frontend" cmd /k "npm run dev"

echo.
echo Waiting for frontend to start...
timeout /t 10 /nobreak >nul

echo.
echo Opening Frontend in browser...
start http://localhost:5173

echo.
echo ========================================
echo    APPLICATIONS STARTED
echo ========================================
echo Swagger:  http://localhost:5296/swagger
echo Frontend: http://localhost:5173
echo ========================================
echo.
pause 