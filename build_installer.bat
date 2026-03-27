@echo off
setlocal
cd /d "%~dp0"

echo [SoundControlYK] Creating Installation Package...
echo.

:: 1. Clean existing build folders
if exist dist rd /s /q dist
if exist dist_electron rd /s /q dist_electron

:: 2. Run the build and package command
:: Using --win nsis explicitly
call npm run build
npx electron-builder --win nsis

echo.
if exist dist_electron (
    echo [SUCCESS] Build finished!
    echo Check the 'dist_electron' folder for your Installer.
) else (
    echo [ERROR] Build failed.
)

pause
