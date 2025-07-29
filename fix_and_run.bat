@echo off
echo ========================================
echo    FIXING AND RUNNING PICX PROJECT
echo ========================================

echo.
echo Current directory: %CD%
echo.

echo Stopping any existing processes...
taskkill /F /IM PicXAPI.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo Checking if we're in the right directory...
if exist "PicXAPI.csproj" (
    echo Found PicXAPI.csproj - we're in the right place!
    goto :run_backend
) else (
    echo PicXAPI.csproj not found. Looking for it...
    if exist "PicXAPI\PicXAPI.csproj" (
        echo Found PicXAPI.csproj in PicXAPI folder
        cd PicXAPI
        goto :run_backend
    ) else (
        echo ERROR: Cannot find PicXAPI.csproj
        echo Please run this script from the PicX root directory
        pause
        exit /b 1
    )
)

:run_backend
echo.
echo Building and running Backend...
echo Current directory: %CD%
dotnet clean
dotnet build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)

echo.
echo Starting Backend...
start "PicX Backend" cmd /k "dotnet run"

echo.
echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Opening Swagger...
start http://localhost:5296/swagger

echo.
echo Starting Frontend...
if exist "ClientApp\package.json" (
    cd ClientApp
    echo Installing frontend dependencies...
    npm install
    echo Starting frontend...
    start "PicX Frontend" cmd /k "npm run dev"
    
    echo.
    echo Waiting for frontend to start...
    timeout /t 10 /nobreak >nul
    
    echo.
    echo Opening Frontend...
    start http://localhost:5173
) else (
    echo WARNING: ClientApp not found in current directory
    echo Frontend will not be started
)

echo.
echo ========================================
echo    PROJECT STATUS
echo ========================================
echo Backend:  http://localhost:5296
echo Swagger:  http://localhost:5296/swagger
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Check the opened command windows for status.
echo.
pause 