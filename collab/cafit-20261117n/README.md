# 20261117n caFit parts for the 5.3 MB HTML mirrors

`push_files` returns HTTP 413 on the four identical 5,305,999-byte mirrors
(`session.html`, `index.html`, `One Nation, Under, ME.html`, `public/session.html`).
These parts assemble to that exact file. `public/session.html` is byte-identical
to `session.html` on this stamp (no `../neptune/` path difference).

Local complete commit: `78994c1063bf1e8d5465671e832aa4981e515511`

Assemble:

```
cat session.html.part00 session.html.part01 session.html.part02 > session.html
cp session.html index.html
cp session.html "One Nation, Under, ME.html"
cp session.html public/session.html
```

Then verify with `git hash-object session.html`. Expected `git hash-object` of the assembled file: `58359cb5eaa1e68ecab80a1cdeda4f614229c3fd` (local commit 78994c1).

- `session.html.part00`  1800000 bytes  sha256 `aad581fcf2fe809c689fbf7cd07c577a08b8bbf832e5f5ffa1fada00a91e4c11`
- `session.html.part01`  1800000 bytes  sha256 `2542fc93a770df05c35916999946d7f03f65121edeb1401c5e2243a6f5aa71cc`
- `session.html.part02`  1705999 bytes  sha256 `b73b510c0cd7e590faacef532c5c743ed411922006ec9d34941836634a1f1e4c`
