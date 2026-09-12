# Find (or start) the game's own local server and print the URL to play on.
#
# The old launchers assumed anything answering on 8765 was the game. It
# often is not — plenty of programs park on a port — and then the browser
# opened a stranger's page, or the launcher announced the port was in use
# and gave up. This asks the port who it is (/__onume) and walks to the
# next port whenever the answer is anybody else.
#
# Only the URL goes to stdout, so a .bat can read it with FOR /F; progress
# goes to stderr, where the person watching the window still sees it.
param(
  [int]$Port = 8765,
  [int]$Tries = 6,
  [string]$Root = $PSScriptRoot,
  [switch]$Quiet
)
$ErrorActionPreference = "Stop"
if (-not $Root) { $Root = Split-Path -Parent $MyInvocation.MyCommand.Path }
$Root = (Resolve-Path $Root).Path
$Serve = Join-Path $Root "Serve-Local.ps1"
if (-not (Test-Path $Serve)) { [Console]::Error.WriteLine("Missing Serve-Local.ps1 in $Root"); exit 1 }

function Note([string]$m) { if (-not $Quiet) { [Console]::Error.WriteLine($m) } }

function Test-PortOpen([int]$p) {
  try {
    $c = New-Object Net.Sockets.TcpClient
    $iar = $c.BeginConnect("127.0.0.1", $p, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(400)
    if ($ok) { try { $c.EndConnect($iar) } catch { $ok = $false } }
    $c.Close()
    return $ok
  } catch { return $false }
}

# "Is that us?" — the server's own root folder comes back, or $null when
# whatever is on that port is not this game.
function Get-ServerRoot([int]$p) {
  try {
    $req = [Net.HttpWebRequest]::Create("http://127.0.0.1:$p/__onume")
    $req.Timeout = 1500
    $req.ReadWriteTimeout = 1500
    $resp = $req.GetResponse()
    $sr = New-Object IO.StreamReader($resp.GetResponseStream())
    $body = $sr.ReadToEnd()
    $sr.Close(); $resp.Close()
    if ($body -like "ONUME-SERVER *") {
      $parts = $body.Split(" ", 4)
      if ($parts.Count -ge 4) { return $parts[3] }
      return ""
    }
    return $null
  } catch { return $null }
}

function Start-Server([int]$p) {
  # Launch from a neutral folder so nothing keeps a handle on the game
  # folder, and reuse this process's own executable so it behaves the
  # same under Windows PowerShell 5.1 and PowerShell 7.
  $hostExe = $null
  try { $hostExe = (Get-Process -Id $PID).Path } catch {}
  if (-not $hostExe) { $hostExe = "powershell.exe" }
  $argv = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $Serve, "-Port", $p, "-Root", $Root, "-Quiet")
  $neutral = [IO.Path]::GetTempPath()
  try {
    Start-Process -FilePath $hostExe -ArgumentList $argv -WorkingDirectory $neutral -WindowStyle Minimized | Out-Null
  } catch {
    Start-Process -FilePath $hostExe -ArgumentList $argv -WorkingDirectory $neutral | Out-Null
  }
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 250
    if ($null -ne (Get-ServerRoot $p)) { return $true }
  }
  return $false
}

for ($p = $Port; $p -lt ($Port + $Tries); $p++) {
  if (Test-PortOpen $p) {
    $r = Get-ServerRoot $p
    if ($null -eq $r) {
      Note "Port $p is in use by another program — trying $($p + 1)."
      continue
    }
    if ($r -and ($r -ne $Root)) {
      Note "Port $p is serving a different copy of the game — trying $($p + 1)."
      continue
    }
    Note "Reusing the game server already on port $p."
    Write-Output "http://127.0.0.1:$p/index.html"
    exit 0
  }
  Note "Starting the local server on http://127.0.0.1:$p/ (PowerShell - no Python)."
  if (Start-Server $p) {
    Note "Leave the minimized server window open while you play. Stop.bat closes it."
    Write-Output "http://127.0.0.1:$p/index.html"
    exit 0
  }
  Note "Port $p did not come up — trying $($p + 1)."
}
[Console]::Error.WriteLine("No free port between $Port and $($Port + $Tries - 1). Run Stop.bat, then try again.")
exit 1
