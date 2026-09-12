@echo off
setlocal EnableDelayedExpansion
REM One Nation, Under, ME. — local HTTP launch (PowerShell server, no Python needed)
REM   StartLocal.bat        play with full graphics
REM   StartLocal.bat safe   play with simple graphics (what SafeStart.bat calls)
cd /d "%~dp0"

if not exist "index.html" (
  echo Missing index.html in %cd%
  pause
  exit /b 1
)
if not exist "vendor\three.min.js" (
  echo Missing vendor\three.min.js — copy the full the-long-session folder.
  pause
  exit /b 1
)
if not exist "Serve-Local.ps1" (
  echo Missing Serve-Local.ps1
  pause
  exit /b 1
)
if not exist "Start-GameServer.ps1" (
  echo Missing Start-GameServer.ps1
  pause
  exit /b 1
)

REM Start-GameServer prints the URL and nothing else on stdout; its
REM progress goes to stderr, which stays on screen. It picks another port
REM when 8765 belongs to some other program, so "port in use" is no
REM longer a dead end.
set "URL="
for /f "usebackq delims=" %%U in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-GameServer.ps1" -Root "%~dp0."`) do set "URL=%%U"

if not defined URL (
  echo The local server would not start. Falling back to Play.bat ^(file://^).
  call "%~dp0Play.bat"
  exit /b %ERRORLEVEL%
)
if /i "%~1"=="safe" set "URL=!URL!?safe=1"

echo Opening !URL!
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "!EDGE!" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "!EDGE!" (
  start "" "!EDGE!" --new-window "!URL!"
  exit /b 0
)
where msedge >nul 2>&1 && (
  start "" msedge --new-window "!URL!"
  exit /b 0
)
where chrome >nul 2>&1 && (
  start "" chrome --new-window "!URL!"
  exit /b 0
)
start "" "!URL!"
exit /b 0
