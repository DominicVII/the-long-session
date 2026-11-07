# Fix Ollama for One Nation Under Me.
# Leave this window open while you play. It is the only door from the
# browser to Ollama, and it only opens for this game. It does not set
# OLLAMA_ORIGINS=*.
$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Ollama for One Nation Under Me"
Write-Host ""
Write-Host "One Nation Under Me — Ollama" -ForegroundColor Yellow
Write-Host ""

function Find-Ollama {
  $cands = @(
    "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
    "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe",
    "C:\Users\Admin\AppData\Local\Programs\Ollama\ollama.exe",
    "C:\Program Files\Ollama\ollama.exe"
  )
  foreach ($c in $cands) { if (Test-Path $c) { return $c } }
  $cmd = Get-Command ollama -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

function Test-Ollama {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 4 -Uri "http://127.0.0.1:11434/api/tags"
    return ($r.StatusCode -eq 200)
  } catch { return $false }
}

$ollama = Find-Ollama
if (-not $ollama) {
  Write-Host "Ollama is not installed." -ForegroundColor Red
  Write-Host "Install it from https://ollama.com/download and run this again."
  Start-Process "https://ollama.com/download"
  exit 1
}
Write-Host "Found $ollama"

if (Test-Ollama) {
  Write-Host "Ollama is already answering on port 11434."
} else {
  Write-Host "Ollama is not answering. Starting it..."
  Get-Process -Name "ollama","Ollama" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
  Start-Process -FilePath $ollama -ArgumentList "serve" -WindowStyle Minimized
  $ok = $false
  foreach ($i in 1..20) {
    Start-Sleep -Seconds 1
    if (Test-Ollama) { $ok = $true; break }
  }
  if (-not $ok) {
    Write-Host "Ollama did not come up on port 11434." -ForegroundColor Red
    Write-Host "Quit Ollama from the system tray (the ^ arrow by the clock), then run this again."
    exit 1
  }
  Write-Host "Ollama is up."
}

$has = $false
try {
  $list = & $ollama list 2>&1 | Out-String
  if ($list -match "llama3\.2") { $has = $true }
} catch {}
if (-not $has) {
  Write-Host "Pulling llama3.2:3b. This is the model the game speaks with. It can take a few minutes the first time."
  & $ollama pull "llama3.2:3b"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "The model did not download. Check the internet and run this again." -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "A llama3.2 model is already on this PC."
}

Write-Host ""
Write-Host "Bridge is opening on http://127.0.0.1:11435" -ForegroundColor Green
Write-Host "Leave this window open while you play. Close it and the voices go back to the offline mind."
Write-Host "Then in the game: Ctrl+F5. Live talk should say Connected."
Write-Host ""

$allowed = {
  param($o)
  if (-not $o) { return $true }
  if ($o -eq "null") { return $true }
  if ($o -eq "https://dominicvii.github.io") { return $true }
  if ($o -eq "https://onenationunderme.grok.me") { return $true }
  if ($o -match '^http://(127\.0\.0\.1|localhost)(:\d+)?$') { return $true }
  return $false
}

$serve = {
  param($client, $allowFn)
  $up = $null
  try {
    $client.ReceiveTimeout = 300000
    $client.SendTimeout = 300000
    $stream = $client.GetStream()
    $headMs = New-Object System.IO.MemoryStream
    $one = New-Object byte[] 1
    $tail = ""
    while ($true) {
      $n = $stream.Read($one, 0, 1)
      if ($n -le 0) { return }
      $headMs.Write($one, 0, 1)
      $tail += [char]$one[0]
      if ($tail.Length -gt 4) { $tail = $tail.Substring($tail.Length - 4) }
      if ($tail -eq "`r`n`r`n") { break }
      if ($headMs.Length -gt 65536) { return }
    }
    $head = [System.Text.Encoding]::ASCII.GetString($headMs.ToArray())
    $lines = $head -split "`r`n"
    $req = $lines[0]
    if ($req -notmatch '^(GET|POST|OPTIONS|HEAD)\s+(\S+)') { return }
    $method = $Matches[1]
    $path = $Matches[2]
    $origin = ""
    $reqHeaders = ""
    $len = 0
    foreach ($ln in $lines) {
      if ($ln -match '(?i)^Origin:\s*(.*)$') { $origin = $Matches[1].Trim() }
      if ($ln -match '(?i)^Access-Control-Request-Headers:\s*(.*)$') { $reqHeaders = $Matches[1].Trim() }
      if ($ln -match '(?i)^Content-Length:\s*(\d+)') { $len = [int]$Matches[1] }
    }
    $okOrigin = & $allowFn $origin
    $echo = $(if ($origin) { $origin } else { "*" })
    $allowHdr = $(if ($reqHeaders) { $reqHeaders } else { "*" })
    $cors = "Access-Control-Allow-Origin: $echo`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: $allowHdr`r`nAccess-Control-Max-Age: 600`r`nVary: Origin`r`n"
    $ascii = [System.Text.Encoding]::ASCII
    if (-not $okOrigin) {
      $deny = $ascii.GetBytes("HTTP/1.1 403 Forbidden`r`nContent-Length: 0`r`nConnection: close`r`n`r`n")
      $stream.Write($deny, 0, $deny.Length)
      return
    }
    if ($method -eq "OPTIONS") {
      $pre = $ascii.GetBytes("HTTP/1.1 204 No Content`r`n$cors`Content-Length: 0`r`nConnection: close`r`n`r`n")
      $stream.Write($pre, 0, $pre.Length)
      return
    }
    $body = $null
    if ($len -gt 0) {
      $body = New-Object byte[] $len
      $got = 0
      while ($got -lt $len) {
        $n = $stream.Read($body, $got, $len - $got)
        if ($n -le 0) { break }
        $got += $n
      }
    }
    $up = New-Object System.Net.Sockets.TcpClient
    $up.ReceiveTimeout = 300000
    $up.SendTimeout = 300000
    try { $up.Connect("127.0.0.1", 11434) } catch {
      $msg = $ascii.GetBytes('{"error":"ollama is not running"}')
      $bad = $ascii.GetBytes("HTTP/1.1 502 Bad Gateway`r`n$cors`Content-Type: application/json`r`nContent-Length: $($msg.Length)`r`nConnection: close`r`n`r`n")
      $stream.Write($bad, 0, $bad.Length)
      $stream.Write($msg, 0, $msg.Length)
      return
    }
    $us = $up.GetStream()
    $fwd = "Host: 127.0.0.1:11434"
    $outLines = New-Object System.Collections.Generic.List[string]
    $outLines.Add($req)
    foreach ($ln in ($lines | Select-Object -Skip 1)) {
      if ($ln -eq "") { continue }
      if ($ln -match '(?i)^(Host|Connection|Origin):') { continue }
      $outLines.Add($ln)
    }
    $outLines.Add($fwd)
    $outLines.Add("Connection: close")
    $rawReq = ($outLines -join "`r`n") + "`r`n`r`n"
    $reqBytes = $ascii.GetBytes($rawReq)
    $us.Write($reqBytes, 0, $reqBytes.Length)
    if ($body) { $us.Write($body, 0, $body.Length) }

    $uh = New-Object System.IO.MemoryStream
    $tail = ""
    while ($true) {
      $n = $us.Read($one, 0, 1)
      if ($n -le 0) { return }
      $uh.Write($one, 0, 1)
      $tail += [char]$one[0]
      if ($tail.Length -gt 4) { $tail = $tail.Substring($tail.Length - 4) }
      if ($tail -eq "`r`n`r`n") { break }
      if ($uh.Length -gt 65536) { return }
    }
    $resp = $ascii.GetString($uh.ToArray())
    $resp = [regex]::Replace($resp, "(?im)^Access-Control-[^\r]*\r?\n", "")
    $resp = $resp -replace "(?i)Connection:\s*keep-alive", "Connection: close"
    if ($resp -notmatch "(?i)^HTTP/") { return }
    $resp = $resp -replace "\r\n\r\n$", "`r`n$cors`Connection: close`r`n`r`n"
    $rb = $ascii.GetBytes($resp)
    $stream.Write($rb, 0, $rb.Length)
    $buf = New-Object byte[] 8192
    while ($true) {
      $n = $us.Read($buf, 0, $buf.Length)
      if ($n -le 0) { break }
      $stream.Write($buf, 0, $n)
      $stream.Flush()
    }
  } catch {
  } finally {
    try { $client.Close() } catch {}
    try { if ($up) { $up.Close() } } catch {}
  }
}

$listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Parse("127.0.0.1"), 11435)
try { $listener.Start() } catch {
  Write-Host "Port 11435 is already in use. If an older bridge is open, you can leave that one and close this." -ForegroundColor Yellow
  exit 1
}
$pool = [runspacefactory]::CreateRunspacePool(1, 6)
$pool.Open()
$live = New-Object System.Collections.Generic.List[object]
Write-Host "Ready." -ForegroundColor Green
while ($true) {
  $client = $listener.AcceptTcpClient()
  $client.NoDelay = $true
  $ps = [powershell]::Create()
  $ps.RunspacePool = $pool
  [void]$ps.AddScript($serve).AddArgument($client).AddArgument($allowed)
  $handle = $ps.BeginInvoke()
  $live.Add(@{ ps = $ps; h = $handle })
  for ($i = $live.Count - 1; $i -ge 0; $i--) {
    if ($live[$i].h.IsCompleted) {
      try { $live[$i].ps.EndInvoke($live[$i].h) } catch {}
      $live[$i].ps.Dispose()
      $live.RemoveAt($i)
    }
  }
}
