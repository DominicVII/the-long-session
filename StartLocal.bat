@echo off
setlocal EnableDelayedExpansion
REM One Nation, Under, ME. — local HTTP launch (PowerShell server, no Python needed)
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

REM Reuse server if already up
powershell -NoProfile -Command "try { $c=New-Object Net.Sockets.TcpClient('127.0.0.1',8765); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo Starting local server on http://127.0.0.1:8765/  ^(PowerShell — no Python^)
  echo Leave the minimized ONUME-http-8765 window open while you play.
  start "ONUME-http-8765" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Serve-Local.ps1" -Port 8765 -Root "%~dp0"
  set /a _n=0
  :waitport
  powershell -NoProfile -Command "try { $c=New-Object Net.Sockets.TcpClient('127.0.0.1',8765); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
  if not errorlevel 1 goto portok
  set /a _n+=1
  if !_n! GEQ 20 (
    echo Server did not start. Falling back to Play.bat ^(file://^).
    call "%~dp0Play.bat"
    exit /b %ERRORLEVEL%
  )
  timeout /t 1 /nobreak >nul
  goto waitport
) else (
  echo Reusing server already on port 8765.
)

:portok
set "URL=http://127.0.0.1:8765/index.html?safe=1"
echo Opening !URL!
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
