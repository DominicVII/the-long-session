@echo off
REM One Nation, Under, ME. — offline file:// launch (no server)
REM Prefer StartLocal.bat — file:// can fail WebGL/localStorage oddly in Edge/Chrome --app.
cd /d "%~dp0"
if not exist "vendor\three.min.js" (
  echo Missing vendor\three.min.js — copy the full the-long-session folder.
  pause
  exit /b 1
)
if not exist "index.html" (
  echo Missing index.html
  pause
  exit /b 1
)
echo Launching via file:// — if you get a blank screen or dead buttons, use StartLocal.bat instead.
where msedge >nul 2>&1 && (
  start "" msedge --app="%cd%\index.html"
  exit /b 0
)
where chrome >nul 2>&1 && (
  start "" chrome --app="%cd%\index.html"
  exit /b 0
)
start "" "%cd%\index.html"
