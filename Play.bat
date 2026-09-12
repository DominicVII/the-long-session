@echo off
REM One Nation, Under, ME. — standalone app window. No server. No internet.
cd /d "%~dp0"
set "GAME=%~dp0One Nation, Under, ME.html"
if not exist "%GAME%" (
  echo Missing "One Nation, Under, ME.html" next to this launcher.
  pause
  exit /b 1
)

where msedge >nul 2>&1 && (
  start "" msedge --app="%GAME%"
  exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%GAME%"
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%GAME%"
  exit /b 0
)
where chrome >nul 2>&1 && (
  start "" chrome --app="%GAME%"
  exit /b 0
)
start "" "%GAME%"
