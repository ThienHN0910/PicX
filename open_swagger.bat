@echo off
echo ========================================
echo    OPENING SWAGGER DOCUMENTATION
echo ========================================

echo.
echo Opening Swagger UI...
start http://localhost:5000/swagger

echo.
echo Opening Swagger JSON...
start http://localhost:5000/swagger/v1/swagger.json

echo.
echo ========================================
echo    SWAGGER URLs
echo ========================================
echo Swagger UI:  http://localhost:5000/swagger
echo Swagger JSON: http://localhost:5000/swagger/v1/swagger.json
echo ========================================
echo.
pause 