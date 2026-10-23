# archive

Kept for the record. Nothing in here runs or is loaded by the game.

- `workflows/` holds the one-shot GitHub Actions that applied base64 patch parts to old builds (20260921e to 20261005a), decoded old docs, and restored `session.html` from a fixed commit if it was ever a stub. Each checks for a build stamp that is long past, so they did nothing but sit in the Actions list. GitHub only runs workflows in `.github/workflows/`, so they no longer run from here.
- `build/` holds the patch parts and assemble scripts those workflows read, and an old copy of `onum-build.ts` (the live one is `src/lib/onum-build.ts`).
- `session-upload.html` is the game as it stood at build 20260917n.
- `MAXOPT-STATUS.md` is a publish status note from 20260921a.

Git history still holds every version. To bring one back, move it out of `archive/`.
