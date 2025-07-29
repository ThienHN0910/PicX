@echo off
echo ========================================
echo    OPENING PICX APPLICATIONS
echo ========================================

echo.
echo Opening Frontend...
start http://localhost:5173

echo.
echo Opening Backend Swagger...
start http://localhost:5000/swagger

echo.
echo ========================================
echo    APPLICATIONS OPENED
echo ========================================
echo Frontend: http://localhost:5173
echo Swagger:  http://localhost:5000/swagger
echo ========================================
echo.
pause 