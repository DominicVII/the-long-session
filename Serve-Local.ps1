# Static file server via TcpListener (no URL ACL / admin, no Python)
param(
  [int]$Port = 8765,
  [string]$Root = $PSScriptRoot
)
$ErrorActionPreference = "Stop"
if (-not $Root) { $Root = Split-Path -Parent $MyInvocation.MyCommand.Path }
$Root = (Resolve-Path $Root).Path
$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="application/javascript"; ".css"="text/css"
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".gif"="image/gif"
  ".webp"="image/webp"; ".svg"="image/svg+xml"; ".json"="application/json"
  ".wasm"="application/wasm"; ".ico"="image/x-icon"; ".mp3"="audio/mpeg"
  ".woff"="font/woff"; ".woff2"="font/woff2"; ".ttf"="font/ttf"; ".map"="application/json"
}
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
try { $listener.Start() } catch {
  Write-Host "Could not bind 127.0.0.1:$Port - $_"
  Start-Sleep 5
  exit 1
}
Write-Host "Serving $Root at http://127.0.0.1:$Port/"
Write-Host "Leave this window open while you play. Ctrl+C to stop."
function Get-RequestPath([System.Net.Sockets.TcpClient]$client) {
  $stream = $client.GetStream()
  $stream.ReadTimeout = 8000
  $buf = New-Object byte[] 8192
  $ms = New-Object System.IO.MemoryStream
  while ($true) {
    $n = 0
    try { $n = $stream.Read($buf, 0, $buf.Length) } catch { break }
    if ($n -le 0) { break }
    $ms.Write($buf, 0, $n)
    $txt = [Text.Encoding]::ASCII.GetString($ms.ToArray())
    if ($txt.Contains("`r`n`r`n")) { break }
    if ($ms.Length -gt 65536) { break }
  }
  $req = [Text.Encoding]::ASCII.GetString($ms.ToArray())
  $line = ($req -split "`r`n")[0]
  if ($line -match '^(GET|HEAD)\s+(\S+)') { return @{ Method = $Matches[1]; Raw = $Matches[2]; Stream = $stream } }
  return @{ Method = "GET"; Raw = "/"; Stream = $stream }
}
while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $info = Get-RequestPath $client
    $stream = $info.Stream
    $raw = $info.Raw
    if ($raw.StartsWith("http")) {
      try { $raw = ([Uri]$raw).PathAndQuery } catch {}
    }
    $pathOnly = $raw.Split("?")[0]
    $rel = [Uri]::UnescapeDataString($pathOnly.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $rel = $rel -replace "/", [IO.Path]::DirectorySeparatorChar
    $status = 200
    $bytes = [byte[]]@()
    $ctype = "text/plain; charset=utf-8"
    if ($rel.Contains("..")) {
      $status = 400
      $bytes = [Text.Encoding]::UTF8.GetBytes("bad path")
    } else {
      $path = Join-Path $Root $rel
      if (Test-Path $path -PathType Container) { $path = Join-Path $path "index.html" }
      if (-not (Test-Path $path -PathType Leaf)) {
        $status = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes("not found")
      } else {
        $bytes = [IO.File]::ReadAllBytes($path)
        $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
        if ($mime.ContainsKey($ext)) { $ctype = $mime[$ext] } else { $ctype = "application/octet-stream" }
      }
    }
    $header = "HTTP/1.1 $status OK`r`nContent-Type: $ctype`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
    $hb = [Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($hb, 0, $hb.Length)
    if ($info.Method -ne "HEAD" -and $bytes.Length -gt 0) { $stream.Write($bytes, 0, $bytes.Length) }
    $stream.Flush()
  } catch {
    # ignore per-request errors
  } finally {
    try { $client.Close() } catch {}
  }
}
