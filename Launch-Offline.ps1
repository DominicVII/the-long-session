param(
  [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot ".")).Path
$url = "http://127.0.0.1:$Port/index.html"

$probe = $null
try {
  $probe = New-Object Net.Sockets.TcpClient("127.0.0.1", $Port)
  $probe.Close()
} catch {
  Start-Process powershell.exe -ArgumentList @(
    "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $root "Serve-Local.ps1"),
    "-Port", $Port,
    "-Root", $root
  ) -WindowStyle Minimized
  for($i = 0; $i -lt 20; $i++){
    Start-Sleep -Milliseconds 250
    try {
      $probe = New-Object Net.Sockets.TcpClient("127.0.0.1", $Port)
      $probe.Close()
      break
    } catch {
      if($i -eq 19){ throw "The offline game server did not start on port $Port." }
    }
  }
}

Start-Process $url
