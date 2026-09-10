# One Nation, Under, ME. — offline desktop launch
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path "vendor\three.min.js")) {
  Write-Host "Missing vendor\three.min.js — pull or restore the full repo folder."
  exit 1
}
$html = (Resolve-Path ".\index.html").Path
$edge = "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
$chrome = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe" }

if (Test-Path $edge) {
  Start-Process $edge -ArgumentList @("--app=`"$html`"")
} elseif (Test-Path $chrome) {
  Start-Process $chrome -ArgumentList @("--app=`"$html`"")
} else {
  Start-Process $html
}
Write-Host "Launched offline. No server, no internet required."
