# One Nation, Under, ME. — start the local server (if it is not already up)
# and open the game. Port selection, identity and the "somebody else has
# that port" case all live in Start-GameServer.ps1.
param(
  [int]$Port = 8765,
  [switch]$Safe
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot ".")).Path
$starter = Join-Path $root "Start-GameServer.ps1"
if (-not (Test-Path $starter)) { throw "Missing Start-GameServer.ps1 in $root" }

$url = & $starter -Port $Port -Root $root
if ($LASTEXITCODE -ne 0 -or -not $url) {
  throw "The offline game server did not start. Run Stop.bat, then try again."
}
if ($Safe) { $url = "$url`?safe=1" }
Start-Process $url
