@echo off
echo Building PicX Backend...
dotnet clean
dotnet build
if %ERRORLEVEL% EQU 0 (
    echo Build successful! Starting backend...
    dotnet run
) else (
    echo Build failed!
    pause
) 