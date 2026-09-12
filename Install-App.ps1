# One Nation, Under, ME. — install as a desktop app.
# Copies the standalone HTML (no vendor folder, no server, no internet)
# to LocalAppData and pins a shortcut to Desktop + Start Menu.
$ErrorActionPreference = "Stop"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Src = Join-Path $Here "One Nation, Under, ME.html"
if (-not (Test-Path $Src)) { throw "Put this script next to 'One Nation, Under, ME.html'" }

$DestDir = Join-Path $env:LOCALAPPDATA "OneNationUnderME"
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
$Dest = Join-Path $DestDir "One Nation, Under, ME.html"
Copy-Item -Force $Src $Dest
$Play = Join-Path $DestDir "Play.bat"
Copy-Item -Force (Join-Path $Here "Play.bat") $Play -ErrorAction SilentlyContinue
if (-not (Test-Path $Play)) {
  @"
@echo off
start "" msedge --app="$Dest"
"@ | Set-Content -Encoding ASCII $Play
}

$Edge = @(
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
$Chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$Target = if ($Edge) { $Edge } elseif ($Chrome) { $Chrome } else { $null }
$Args = "--app=`"$Dest`""

function New-Shortcut($Path, $TargetPath, $Arguments, $WorkDir, $Desc) {
  $w = New-Object -ComObject WScript.Shell
  $s = $w.CreateShortcut($Path)
  $s.TargetPath = $TargetPath
  $s.Arguments = $Arguments
  $s.WorkingDirectory = $WorkDir
  $s.Description = $Desc
  $s.WindowStyle = 1
  $s.Save()
}

$Desk = [Environment]::GetFolderPath("Desktop")
$Start = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs"
New-Item -ItemType Directory -Force -Path $Start | Out-Null
$Name = "One Nation, Under, ME.lnk"

if ($Target) {
  New-Shortcut (Join-Path $Desk $Name) $Target $Args $DestDir "One Nation, Under, ME."
  New-Shortcut (Join-Path $Start $Name) $Target $Args $DestDir "One Nation, Under, ME."
} else {
  New-Shortcut (Join-Path $Desk $Name) $Dest $null $DestDir "One Nation, Under, ME."
  New-Shortcut (Join-Path $Start $Name) $Dest $null $DestDir "One Nation, Under, ME."
}

Write-Host "Installed."
Write-Host "  $Dest"
Write-Host "Desktop and Start Menu shortcuts created."
Write-Host "Double-click the shortcut. No internet. No server."
