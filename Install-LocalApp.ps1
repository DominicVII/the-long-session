# One Nation, Under, ME. — install as a local Windows app (shortcuts + icon)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Launch = Join-Path $Root "StartLocal.bat"
$Offline = Join-Path $Root "Play.bat"
$Logo = Join-Path $Root "assets\logo.png"
$Ico = Join-Path $Root "assets\app.ico"

if (-not (Test-Path $Launch)) { throw "Missing StartLocal.bat in $Root" }
if (-not (Test-Path (Join-Path $Root "index.html"))) { throw "Missing index.html" }
if (-not (Test-Path (Join-Path $Root "vendor\three.min.js"))) { throw "Missing vendor\three.min.js" }

# Build a simple .ico from logo.png if possible (System.Drawing)
function New-AppIco {
  param($Png, $OutIco)
  try {
    Add-Type -AssemblyName System.Drawing
    # Read the bytes first: Image.FromFile keeps the file open for the
    # lifetime of the object, which is one more thing that can report the
    # game folder "in use" if anything here throws.
    $pngBytes = [IO.File]::ReadAllBytes($Png)
    $srcMs = New-Object System.IO.MemoryStream(,$pngBytes)
    $img = [System.Drawing.Image]::FromStream($srcMs)
    $sizes = @(256, 48, 32, 16)
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter $ms
    $bw.Write([byte]0); $bw.Write([byte]0) # reserved
    $bw.Write([int16]1) # type icon
    $bw.Write([int16]$sizes.Count)
    $offset = 6 + (16 * $sizes.Count)
    $frames = @()
    foreach ($s in $sizes) {
      $bmp = New-Object System.Drawing.Bitmap $s, $s
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.Clear([System.Drawing.Color]::Transparent)
      $g.DrawImage($img, 0, 0, $s, $s)
      $g.Dispose()
      $pngMs = New-Object System.IO.MemoryStream
      $bmp.Save($pngMs, [System.Drawing.Imaging.ImageFormat]::Png)
      $bytes = $pngMs.ToArray()
      $pngMs.Dispose(); $bmp.Dispose()
      $frames += ,@{ Size=$s; Bytes=$bytes; Offset=$offset }
      $offset += $bytes.Length
    }
    $img.Dispose(); $srcMs.Dispose()
    foreach ($f in $frames) {
      $szByte = if ($f.Size -ge 256) { [byte]0 } else { [byte]$f.Size }
      $bw.Write($szByte)
      $bw.Write($szByte)
      $bw.Write([byte]0); $bw.Write([byte]0)
      $bw.Write([int16]1); $bw.Write([int16]32)
      $bw.Write([int32]$f.Bytes.Length)
      $bw.Write([int32]$f.Offset)
    }
    foreach ($f in $frames) { $bw.Write($f.Bytes) }
    $bw.Flush()
    [IO.File]::WriteAllBytes($OutIco, $ms.ToArray())
    $bw.Dispose(); $ms.Dispose()
    return $true
  } catch {
    Write-Host "Icon build skipped: $_"
    return $false
  }
}

if (Test-Path $Logo) { [void](New-AppIco -Png $Logo -OutIco $Ico) }

function New-Shortcut {
  param($Path, $Target, $WorkDir, $Icon, $Desc)
  $w = New-Object -ComObject WScript.Shell
  $s = $w.CreateShortcut($Path)
  $s.TargetPath = $Target
  $s.WorkingDirectory = $WorkDir
  $s.Description = $Desc
  $s.WindowStyle = 7  # minimized for the bat console if any
  if ($Icon -and (Test-Path $Icon)) { $s.IconLocation = "$Icon,0" }
  $s.Save()
}

$Desktop = [Environment]::GetFolderPath("Desktop")
$StartDir = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs\One Nation Under ME"
New-Item -ItemType Directory -Force -Path $StartDir | Out-Null

$Name = "One Nation, Under, ME"
$DeskLnk = Join-Path $Desktop "$Name.lnk"
$StartLnk = Join-Path $StartDir "$Name.lnk"
$IconPath = if (Test-Path $Ico) { $Ico } else { $null }

New-Shortcut -Path $DeskLnk -Target $Launch -WorkDir $Root -Icon $IconPath -Desc "Play One Nation, Under, ME. locally"
New-Shortcut -Path $StartLnk -Target $Launch -WorkDir $Root -Icon $IconPath -Desc "Play One Nation, Under, ME. locally"

# Also a Start Menu "Offline (file)" entry
$OffLnk = Join-Path $StartDir "One Nation (offline file).lnk"
if (Test-Path $Offline) {
  New-Shortcut -Path $OffLnk -Target $Offline -WorkDir $Root -Icon $IconPath -Desc "Offline file:// launch (fallback)"
}

# Simple graphics, for a machine that stutters on the full scene.
$SafeBat = Join-Path $Root "SafeStart.bat"
if (Test-Path $SafeBat) {
  New-Shortcut -Path (Join-Path $StartDir "One Nation (simple graphics).lnk") -Target $SafeBat -WorkDir $Root -Icon $IconPath -Desc "Play with simple graphics"
}

# And a way to close the server again, so a window left running from an
# earlier session is never the thing holding the port or the folder.
$StopBat = Join-Path $Root "Stop.bat"
if (Test-Path $StopBat) {
  New-Shortcut -Path (Join-Path $StartDir "Close the game server.lnk") -Target $StopBat -WorkDir $Root -Icon $IconPath -Desc "Close the local server and free the port"
}

# Pin-friendly Programs root shortcut
$RootLnk = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs\$Name.lnk"
New-Shortcut -Path $RootLnk -Target $Launch -WorkDir $Root -Icon $IconPath -Desc "Play One Nation, Under, ME. locally"

Write-Host "Installed local app:"
Write-Host "  Desktop: $DeskLnk"
Write-Host "  Start:   $StartLnk"
Write-Host "  Stop:    Start Menu -> One Nation Under ME -> Close the game server"
Write-Host "Launch uses StartLocal.bat -> http://127.0.0.1:8765/index.html (next free port if that one is taken)"
