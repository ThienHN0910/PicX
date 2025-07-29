@echo off
echo Installing frontend dependencies...
npm install
if %ERRORLEVEL% EQU 0 (
    echo Dependencies installed! Starting frontend...
    npm run dev
) else (
    echo Failed to install dependencies!
    pause
) 