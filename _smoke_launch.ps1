$ErrorActionPreference = "Continue"
$root = "C:\Users\Admin\the-long-session"
Start-Process powershell -WindowStyle Minimized -ArgumentList @(
  "-NoProfile","-ExecutionPolicy","Bypass","-File",
  (Join-Path $root "Serve-Local.ps1"),
  "-Port","8765","-Root",$root
)
Start-Sleep 3
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8765/index.html?safe=1" -UseBasicParsing -TimeoutSec 10
  Write-Host ("STATUS=" + $r.StatusCode + " LEN=" + $r.RawContentLength)
} catch {
  Write-Host ("FAIL=" + $_.Exception.Message)
}
$w = New-Object -ComObject WScript.Shell
$desk = [Environment]::GetFolderPath("Desktop")
$lnkPath = Join-Path $desk "One Nation, Under, ME.lnk"
$s = $w.CreateShortcut($lnkPath)
$s.TargetPath = Join-Path $root "StartLocal.bat"
$s.WorkingDirectory = $root
$ico = Join-Path $root "assets\app.ico"
if (Test-Path $ico) { $s.IconLocation = "$ico,0" }
$s.Description = "One Nation local app (PowerShell server)"
$s.Save()
Write-Host "SHORTCUT_OK"
