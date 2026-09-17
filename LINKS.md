# One Nation, Under, ME. — canonical links

Keep this file as the single source for play / share URLs.

## Public share (preferred)

| | |
|--|--|
| **Grok.me (canonical public)** | https://onenationunderme.grok.me/ |
| **Short link** | https://t.co/zAEFb22f5z → onenationunderme.grok.me |
| **Project id** | `01a096d7-1938-7821-bb9d-c399aec9214a` |
| **Iframe game** | https://onenationunderme.grok.me/session.html?v=20260917n |

> Wrapper iframes `/session.html?v=…`. After uploading a new `session.html` in Grok Build, bump `?v=` so clients skip cache. Cache-bust `?v=20260917n` after this freeze republish.

## Local (KingDominic / any Windows copy)

| | |
|--|--|
| **Launch** | `StartLocal.bat` or Desktop **One Nation, Under, ME.** |
| **Safe play URL** | http://127.0.0.1:8765/index.html?safe=1 |
| **Server** | `Serve-Local.ps1` (PowerShell TcpListener on port 8765) |
| **Offline fallback** | `Play.bat` (`file://`) |
| **Folder** | `C:\Users\Admin\the-long-session\` |

## Public (repo `DominicVII/the-long-session` @ `main`)

| | |
|--|--|
| **Share / CDN** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |
| **Raw** | https://raw.githubusercontent.com/DominicVII/the-long-session/main/index.html |
| **Repo** | https://github.com/DominicVII/the-long-session |

## Hosting notes (grok.me)

- Live site is a Grok app-builder wrapper; game body is **standalone** `session.html` (THREE inlined).
- Repo `session.html` matches optimized `index.html` (external `vendor/three.min.js`) for local/HTTP.
- For grok.me upload use **`session.standalone.html`** (inlined THREE + MODEST/Simple, build `20260917n`).
- **Publish blocker:** no grok.com session on this agent box; deployer API is auth-gated. User must open Grok Build for project `01a096d7-1938-7821-bb9d-c399aec9214a`, replace `session.html` with `session.standalone.html` contents, set iframe to `?v=20260917n`, then Publish.

## Do not use

| | |
|--|--|
| **raw.githack** | Returns 403 |
| **Store `python.exe` stubs** | Not a real Python — use `StartLocal.bat` instead |

## Continuity

Saves are in browser `localStorage` for that origin.  
`file://`, `http://127.0.0.1:8765`, jsDelivr, and `onenationunderme.grok.me` are **different origins** — each has its own save.
