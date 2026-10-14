# Update without Git (Windows)

Until Git is installed, use these steps to pull the latest version of **One Nation, Under, ME.** into your existing folder.

Copy each line, right-click inside PowerShell to paste it, and press Enter. Wait for the `PS C:\...>` prompt to come back before doing the next one.

---

### 1. Download the latest version
(a few seconds; it may show a progress bar)

```powershell
Invoke-WebRequest "https://github.com/DominicVII/the-long-session/archive/refs/heads/main.zip" -OutFile "$env:TEMP\onum.zip"
```

### 2. Unzip it

```powershell
Expand-Archive "$env:TEMP\onum.zip" "$env:TEMP\onum" -Force
```

### 3. Copy it over your game folder
(adjust the path if your folder is not `C:\Users\Admin\the-long-session`)

```powershell
Copy-Item "$env:TEMP\onum\the-long-session-main\*" "C:\Users\Admin\the-long-session" -Recurse -Force
```

### 4. Open the game

```powershell
Start-Process "C:\Users\Admin\the-long-session\One Nation, Under, ME.html"
```

---

### Verify the update

When it opens, check that:

- the address bar ends in `?v=20261013n` (press **Ctrl + F5** if it doesn't)
- the top left says **Governor**, not Member of the House
- the panel tab says **State**

From now on, steps 1–4 are how you update, until Git is installed.  
If any line turns red, screenshot it and send it over.

---

**With Git** (once installed):

```powershell
cd C:\Users\Admin\the-long-session
git pull
Start-Process ".\One Nation, Under, ME.html"
```
