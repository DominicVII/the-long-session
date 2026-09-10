$ErrorActionPreference = "Continue"
$root = "C:\Users\Admin\the-long-session"
$serve = Join-Path $root "Serve-Local.ps1"
$out = Join-Path $root "_serve_out.log"
$err = Join-Path $root "_serve_err.log"
# kill old listeners on 8765 if any
Get-NetTCPConnection -LocalPort 8765 -ErrorAction SilentlyContinue | ForEach-Object {
  try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
}
Start-Sleep 1
$p = Start-Process -FilePath "powershell.exe" -PassThru -WindowStyle Normal -RedirectStandardOutput $out -RedirectStandardError $err -ArgumentList @(
  "-NoProfile","-ExecutionPolicy","Bypass","-File",$serve,"-Port","8765","-Root",$root
)
Start-Sleep 4
"PID=$($p.Id) HAS_EXITED=$($p.HasExited)" | Write-Host
if (Test-Path $out) { Write-Host "OUT:"; Get-Content $out -ErrorAction SilentlyContinue }
if (Test-Path $err) { Write-Host "ERR:"; Get-Content $err -ErrorAction SilentlyContinue }
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8765/index.html" -UseBasicParsing -TimeoutSec 5
  Write-Host ("STATUS=" + $r.StatusCode + " LEN=" + $r.RawContentLength)
} catch {
  Write-Host ("FAIL=" + $_.Exception.Message)
}
Get-NetTCPConnection -LocalPort 8765 -ErrorAction SilentlyContinue | Format-Table LocalAddress,LocalPort,State,OwningProcess -AutoSize
