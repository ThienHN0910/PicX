@echo off
echo ========================================
echo    OPENING SWAGGER ON PORT 5296
echo ========================================

echo.
echo Opening Swagger UI...
start http://localhost:5296/swagger

echo.
echo Opening Swagger JSON...
start http://localhost:5296/swagger/v1/swagger.json

echo.
echo ========================================
echo    SWAGGER URLs
echo ========================================
echo Swagger UI:  http://localhost:5296/swagger
echo Swagger JSON: http://localhost:5296/swagger/v1/swagger.json
echo Backend API: http://localhost:5296
echo ========================================
echo.
echo Make sure backend is running first!
echo.
pause 