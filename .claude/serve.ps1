$root = "C:\Users\Admin\the-long-session"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8777/")
$listener.Start()
Write-Output "serving $root on http://localhost:8777/"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath).TrimStart('/')
    if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
    $file = Join-Path $root $rel
    if (Test-Path $file -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = "application/octet-stream"
      if ($ext -eq ".html") { $ct = "text/html; charset=utf-8" }
      elseif ($ext -eq ".js") { $ct = "application/javascript; charset=utf-8" }
      elseif ($ext -eq ".json") { $ct = "application/json; charset=utf-8" }
      $ctx.Response.ContentType = $ct
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
  } catch { }
}
