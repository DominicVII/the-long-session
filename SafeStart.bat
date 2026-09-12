@echo off
REM Safe Start — simple graphics, HTTP server, normal browser window (not --app).
REM Use this one if the full-graphics launch stutters or shows a black view.
cd /d "%~dp0"
call "%~dp0StartLocal.bat" safe
