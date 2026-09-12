# When something says it is "in use"

Everything here is about one thing: the minimized PowerShell window the
launcher opens, titled **ONUME game server - port 8765**. It is the local
web server the game is served from. It has no timer and no exit condition
— if nobody closes it, it is still there tomorrow, still holding its port.

**Close it with `Stop.bat`** (or Start Menu → *One Nation Under ME* →
*Close the game server*). That is the whole fix for most of what follows.

---

## "The port is in use" / the launcher gave up

Nothing to do — the launcher now walks to the next free port (8765, then
8766, and so on up to 8770) and tells you which one it used. It also asks
each port who it is before reusing it, so it can no longer hand you some
other program's page and call it the game.

If you would rather have 8765 back, run `Stop.bat`. When the port is held
by something that is not the game, `Stop.bat` names the program and its
process ID rather than leaving you to guess.

## Windows says the game folder is in use

A running server used to sit *inside* the game folder, and Windows will
not let you move, rename or delete a folder a process is sitting in. The
server now runs from the temp folder instead, so this stops happening
after this update — but a server started **before** the update is still
the old kind. Run `Stop.bat` once and it is gone for good.

`git pull`, `update.ps1` and copying the folder to another machine all
fail the same way for the same reason, and are fixed the same way.

## Another program says your microphone is in use

**Hold V** (or hold pad **X**) is speak-aloud, and the browser holds the
microphone for as long as it is listening. If you alt-tabbed away while
still holding the key, the release never reached the game, and the tab
kept the microphone — so the next program you open to talk to is told the
mic is busy.

The game now hands the microphone back whenever its window goes to the
background, so this should not recur. If a tab is still holding it, close
the browser tab the game is in; the microphone is released with it.

## The game opens but the page is somebody else's

Fixed by the identity check described above. If you see it on an old
copy, run `Stop.bat` and launch again.

## Nothing above matches — what is holding this thing?

In a normal (non-admin) PowerShell window:

```powershell
# What is listening on the game's ports?
Get-NetTCPConnection -LocalPort 8765..8770 -State Listen |
  ForEach-Object { "{0} -> {1}" -f $_.LocalPort, (Get-Process -Id $_.OwningProcess).ProcessName }

# Any game server left running, whatever its port?
Get-CimInstance Win32_Process -Filter "Name like '%powershell%' OR Name like '%pwsh%'" |
  Where-Object { $_.CommandLine -like "*Serve-Local.ps1*" } |
  Select-Object ProcessId, CommandLine
```

`Stop.bat` stops everything the second command finds.

---

# When the game itself misbehaves

## Blank or black view, dead buttons

Use `StartLocal.bat`, not `Play.bat`. `file://` restricts WebGL and
storage in ways a local server does not.

## It runs, but it stutters

`SafeStart.bat` — simple graphics, same save. (Full graphics is what
`StartLocal.bat` and the desktop shortcut use.)

## The save is gone

Saves live in the browser's `localStorage`, per browser and per profile.
Launching in a different browser shows no career, and clearing browsing
data removes it. Export a career you care about: **Career → Export career
save**, and **Import career save** to bring it back.

## PowerShell refuses to run the scripts

The launchers already pass `-ExecutionPolicy Bypass`, which covers the
usual case. If you start a script by hand and Windows blocks it, right-
click the `.ps1` → Properties → **Unblock**.
