@echo off
setlocal
cd /d "%~dp0"

echo [SoundControlYK] Creating Distribution Package...
echo.

:: 1. Clean existing build folders (optional)
if exist dist rd /s /q dist
if exist dist_electron rd /s /q dist_electron

:: 2. Run the build and package command
call npm run app:dist

echo.
if exist dist_electron (
    echo [SUCCESS] Build finished!
    echo Check the 'dist_electron' folder for your .exe files.
    echo.
    echo 1. SoundControlYK [Version].exe - Installer
    echo 2. SoundControlYK [Version].exe (Portable) - No installation required
) else (
    echo [ERROR] Build failed. Please check the logs.
)

pause
