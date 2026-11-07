@echo off
title Ollama for One Nation Under Me
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Fix Ollama.ps1"
echo.
echo The bridge stopped. Live talk will use the offline mind until you run this again.
pause
