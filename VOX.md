# Vox — unchained

Individuals (every member = full individual) interact on Vox and may say **literally anything**. The computer **types** their words out. **No fix.**

## No fix / no chain
- Player free-text posts use the **exact** string typed. Menu `voxYouLine` is only a fallback when they did not write anything.
- `#voxText` maxlength is **2000** (was 400).
- Do not strip profanity, caps, typos, or weirdness. `voxMarkup` only wraps `@mention` spans — never alters visible words.
- Taylor blasphemy remains a **consequence** (`checkSpeakBlasphemy`) if uttered; the post still **displays unchanged**.

## Freeform NPC speech
- `voxFree(m, ctx)` builds novel lines from traits, mood, bill, rival/ally handles, recent posts, personal asides, heat/jokes/rants, and that person’s **thought / hope / vision / mind**.
- `voxReplyFree(p, post)` answers the **substance** of a post (quotes a short fragment; agree / fight / deflect / ramble).
- Appetite / temper gate **how often**, not **what** they may say.
- Cross-member: unsolicited replies under hot posts; members `@` each other without the player.

## Typewriter
- New feed rows type body characters over ~20–40ms each.
- Skipped if `prefers-reduced-motion` or `post.typed` is already set.
- CSS/JS only — no external LLM API.

## UI
- Placeholder: “Say anything. No script. They will answer in kind.”
- Hint: unchained — individuals type freely; the machine types it out.

See also `AUTONOMY.md` for retained mind / invented concepts.
