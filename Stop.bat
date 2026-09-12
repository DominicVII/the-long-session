@echo off
REM One Nation, Under, ME. — close the local server (frees the port and the folder)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Stop-Local.ps1"
echo.
pause
