@echo off
setlocal
cd /d "%~dp0"

echo [SoundControlYK] Starting One-Window Launch...
echo.

:: 1. Start Server in background of THIS window (/b)
start /b cmd /c "npm run dev"

echo Waiting for server (6s)...
timeout /t 6 /nobreak > nul

echo Launching Player UI...
:: 2. Run Electron directly in THIS window
npm run electron

echo Application closed. Launcher exiting...
timeout /t 3 /nobreak > nul
exit
