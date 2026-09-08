# Update The Long Session from git (fast-forward only).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "Updating The Long Session..."
git pull --ff-only
if ($LASTEXITCODE -ne 0) {
  Write-Host "git pull failed. Resolve conflicts or fetch manually, then retry."
  exit $LASTEXITCODE
}
Write-Host ""
Write-Host "Up to date. Open index.html to play (no server needed)."
Write-Host "Repo: https://github.com/DominicVII/the-long-session"
