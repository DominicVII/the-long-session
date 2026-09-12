# Close the game's local server and free the port (and the folder).
#
# This is the answer to "something has it in use". A server window left
# running from an earlier session keeps its port, and — before the fix in
# Serve-Local.ps1 — kept a handle on the game folder as well. Run this
# and both go back to being free.
param(
  [int]$Port = 8765,
  [int]$Tries = 6,
  [switch]$Quiet
)
$ErrorActionPreference = "Continue"

function Get-StateDir {
  $base = $env:LOCALAPPDATA
  if (-not $base) { $base = [IO.Path]::GetTempPath() }
  return (Join-Path $base "OneNationUnderME")
}

# Ask a port who it is before sending it anything else, so this never
# pokes at some unrelated program that happens to sit in our range.
function Test-OurServer([int]$p) {
  try {
    $req = [Net.HttpWebRequest]::Create("http://127.0.0.1:$p/__onume")
    $req.Timeout = 1500
    $req.ReadWriteTimeout = 1500
    $resp = $req.GetResponse()
    $sr = New-Object IO.StreamReader($resp.GetResponseStream())
    $body = $sr.ReadToEnd()
    $sr.Close(); $resp.Close()
    return ($body -like "ONUME-SERVER *")
  } catch { return $false }
}

function Request-Quit([int]$p) {
  try {
    $req = [Net.HttpWebRequest]::Create("http://127.0.0.1:$p/__quit")
    $req.Timeout = 2000
    $req.ReadWriteTimeout = 2000
    $resp = $req.GetResponse()
    $sr = New-Object IO.StreamReader($resp.GetResponseStream())
    $body = $sr.ReadToEnd()
    $sr.Close(); $resp.Close()
    return ($body -like "ONUME-SERVER*")
  } catch { return $false }
}

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

# Who is holding a port we could not clear — named, so you are not left
# guessing what "in use" means.
function Show-PortOwner([int]$p) {
  try {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($conn) {
      $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
      if ($proc) { Write-Host "  Port $p is held by $($proc.ProcessName) (PID $($proc.Id)) — not the game." ; return }
    }
  } catch {}
  Write-Host "  Port $p is held by another program. In an admin prompt: netstat -ano | findstr :$p"
}

$stopped = 0
$dir = Get-StateDir
if (Test-Path $dir) {
  foreach ($f in (Get-ChildItem -LiteralPath $dir -Filter "server-*.txt" -ErrorAction SilentlyContinue)) {
    $lines = @()
    try { $lines = Get-Content -LiteralPath $f.FullName } catch {}
    if ($lines.Count -lt 2) { Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue; continue }
    $srvPid = 0; $srvPort = 0
    [void][int]::TryParse($lines[0].Trim(), [ref]$srvPid)
    [void][int]::TryParse($lines[1].Trim(), [ref]$srvPort)
    $proc = $null
    if ($srvPid -gt 0) { $proc = Get-Process -Id $srvPid -ErrorAction SilentlyContinue }
    if (-not $proc) {
      # Left over from a server that is already gone.
      Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
      continue
    }
    if (-not $Quiet) { Write-Host "Stopping the game server on port $srvPort (PID $srvPid)..." }
    # Ask first: a clean exit releases the port and tidies its own state file.
    [void](Request-Quit $srvPort)
    for ($i = 0; $i -lt 20; $i++) {
      Start-Sleep -Milliseconds 200
      if (-not (Get-Process -Id $srvPid -ErrorAction SilentlyContinue)) { break }
    }
    if (Get-Process -Id $srvPid -ErrorAction SilentlyContinue) {
      try { Stop-Process -Id $srvPid -Force -ErrorAction Stop } catch {}
      Start-Sleep -Milliseconds 400
    }
    Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
    $stopped++
  }
}

# A server started before this fix shipped has no state file, so sweep the
# ports the launchers use and ask anything that answers as ours to quit.
for ($p = $Port; $p -lt ($Port + $Tries); $p++) {
  if (-not (Test-PortOpen $p)) { continue }
  if (-not (Test-OurServer $p)) { continue }
  if (Request-Quit $p) {
    $stopped++
    if (-not $Quiet) { Write-Host "Stopped the game server on port $p." }
    Start-Sleep -Milliseconds 300
  }
}

if (-not $Quiet) {
  if ($stopped -gt 0) { Write-Host "Closed $stopped game server(s). The port and the game folder are free again." }
  else { Write-Host "No game server was running." }
  $busy = @()
  for ($p = $Port; $p -lt ($Port + $Tries); $p++) { if (Test-PortOpen $p) { $busy += $p } }
  if ($busy.Count -gt 0) {
    Write-Host ""
    Write-Host "Still in use by something else:"
    foreach ($p in $busy) { Show-PortOwner $p }
    Write-Host "That is fine — the launchers skip a busy port and use the next one."
  }
}
exit 0
