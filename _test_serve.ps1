$ErrorActionPreference = "Continue"
$root = "C:\Users\Admin\the-long-session"
$log = Join-Path $root "_serve_test.log"
try {
  "start $(Get-Date)" | Out-File $log
  $port = 8765
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
  $listener.Start()
  "bound ok" | Out-File $log -Append
  # accept one connection in background job style - just prove bind
  $clientTask = {
    param($l)
    $c = $l.AcceptTcpClient()
    $c.Close()
  }
  # Write a tiny response server for 8 seconds using runspace-less loop with timeout
  $end = (Get-Date).AddSeconds(6)
  while ((Get-Date) -lt $end) {
    if ($listener.Pending()) {
      $client = $listener.AcceptTcpClient()
      $stream = $client.GetStream()
      $buf = New-Object byte[] 2048
      try { [void]$stream.Read($buf, 0, $buf.Length) } catch {}
      $body = [Text.Encoding]::UTF8.GetBytes("ok")
      $hdr = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 200 OK`r`nContent-Length: 2`r`nConnection: close`r`n`r`n")
      $stream.Write($hdr, 0, $hdr.Length)
      $stream.Write($body, 0, $body.Length)
      $client.Close()
      "served one" | Out-File $log -Append
      break
    }
    Start-Sleep -Milliseconds 100
  }
  $listener.Stop()
  "done" | Out-File $log -Append
} catch {
  $_ | Out-String | Out-File $log -Append
}
