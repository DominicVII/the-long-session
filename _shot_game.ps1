Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
}
"@
$targets = @()
[Win]::EnumWindows({
  param($h, $l)
  if(-not [Win]::IsWindowVisible($h)){ return $true }
  $sb = New-Object System.Text.StringBuilder 512
  [void][Win]::GetWindowText($h, $sb, $sb.Capacity)
  $t = $sb.ToString()
  if($t -match 'One Nation|Under,? ME|the-long-session|Play\.bat|index\.html|Chromium|Edge|Chrome|Firefox|Opera'){
    $script:targets += [pscustomobject]@{ H=$h; Title=$t }
  }
  return $true
}, [IntPtr]::Zero)
$pick = $targets | Select-Object -First 1
if(-not $pick){
  $h = [Win]::GetForegroundWindow()
  $sb = New-Object System.Text.StringBuilder 512
  [void][Win]::GetWindowText($h, $sb, $sb.Capacity)
  $pick = [pscustomobject]@{ H=$h; Title=$sb.ToString() }
}
$r = New-Object Win+RECT
[void][Win]::GetWindowRect($pick.H, [ref]$r)
$w = [Math]::Max(1, $r.Right - $r.Left)
$hgt = [Math]::Max(1, $r.Bottom - $r.Top)
$bmp = New-Object System.Drawing.Bitmap $w, $hgt
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.Left, $r.Top, 0, 0, (New-Object System.Drawing.Size $w, $hgt))
$out = Join-Path $PSScriptRoot '_walk_shot.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output ("TITLE=" + $pick.Title)
Write-Output ("PATH=" + $out)
Write-Output ("SIZE=" + $w + "x" + $hgt)
