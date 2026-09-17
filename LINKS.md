# One Nation, Under, ME. — canonical links

Keep this file as the single source for play / share URLs.

## Public share (preferred)

| | |
|--|--|
| **Grok.me (canonical public)** | https://onenationunderme.grok.me/ |
| **Short link** | https://t.co/zAEFb22f5z → onenationunderme.grok.me |
| **GitHub Pages** | https://dominicvii.github.io/the-long-session/ |
| **Iframe game** | https://onenationunderme.grok.me/session.html?v=20260917q |

> Wrapper iframes `/session.html?v=…`. After a new `session.html`, bump `?v=` so Edge skips cache. Current: **`20260917q`**.

## Local (KingDominic / any Windows copy)

| | |
|--|--|
| **Launch** | `StartLocal.bat` or Desktop **One Nation, Under, ME.** |
| **Safe play URL** | http://127.0.0.1:8765/index.html?safe=1 |
| **Offline fallback** | `Play.bat` (`file://`) |
| **Folder** | `C:\Users\Admin\the-long-session\` |

## Public (repo `DominicVII/the-long-session` @ `main`)

| | |
|--|--|
| **Share / CDN** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |
| **raw.githack** | https://raw.githack.com/DominicVII/the-long-session/main/index.html |
| **Repo** | https://github.com/DominicVII/the-long-session |

## Hosting notes

- Live grok.me is a wrapper; game body is standalone `session.html` (THREE inlined).
- Repo playable files are the same body: `index.html`, `session.html`, `One Nation, Under, ME.html`.
- **Keep `20260917q` (or bump the letter) on `<meta name="onum-build">` and the iframe `?v=` together.**
