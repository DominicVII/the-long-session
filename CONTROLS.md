# Controls — One Nation, Under, ME.

Three modes. None is a gate for the others.

| Mode | What you need |
|------|----------------|
| **KBM solo** | Keyboard + mouse only — no gamepad, no `has-pad`, no D-pad arming |
| **Pad solo** | Controller only — every play action reachable without touching the keyboard |
| **Hybrid** | One hand on pad + mouse look/click — both streams stay live and additive |

## KBM solo

| Input | Action |
|-------|--------|
| W / S | Walk |
| A / D | Look left / right |
| Q / C | Step aside |
| Arrows | Look |
| Drag on view | Look (yaw / pitch) |
| Click | Sit / speak / use |
| **E** | Speak / use / catch live line / deliver pieced speech / confirm glass prompt (first or selected) / sit casually at **My desk** |
| **1–9** | Fire that prompt / seated act (no D-pad needed) |
| Space | Pause |
| F | Phone |
| Hold V | Speak aloud |
| H | House panels · Shift+H immersive |
| **Hold ? or /** | Show on-glass KBM tips (hidden again on release) |

FPV help chips (`.keys`) are **hidden by default**. No permanent “press ?” chrome.

## Pad solo

| Input | Action |
|-------|--------|
| Left stick | Move (or **phone UI cursor** while the phone is open) |
| Right stick | Look |
| **A** | Sit / use / catch / deliver / confirm D-pad-selected prompt · sit casually at office desk |
| **B** | Back / close |
| **X** | Today's schedule (Day tab on phone) |
| Hold **X** | Speak aloud |
| **Y** / View | Phone |
| **LT · RT** | Catch live podium line · deliver when pieces ready · cycle seated voice |
| D-pad | Arm / move prompt selection (pad path only; **prompt-only while `#prompt.is-live`**) |
| LB / RB | Panels / tabs (RB also hurries proc when not your turn) |
| Start | Pause |
| L3 / triggers (when not catch/seated) | Sprint |

Pad legend (`#padBar`) shows **only while a pad is connected** — including while CATCH / glass prompts are up.

## Hybrid (pad + mouse)

- Mouse drag-look and right-stick look both apply (incremental mouse deltas + stick turn).
- Mouse click sit/use/speak still works with a pad connected.
- Left stick walk still works while the mouse is moving (except while the phone is open).
- Keyboard (E, 1–9, V, F, H, …) remains available alongside the pad.
- Do **not** require pad D-pad arming for mouse clicks or keyboard confirms.

## Glass prompts & seated voice

- **KBM:** `1–4` or `E` fire seated shout / heckle / mind / out-of-hand without D-pad.
- **Pad:** D-pad (or LT·RT) to select, **A** to confirm — pad-only convention. Selection is preserved across CATCH ticker rebuilds (`data-gp`).
- **CATCH ticker:** frame-based — drains one rendered frame at a time (not wall-clock). Remaining window shows as `Nf`.
- **Bottom Wire ticker:** frame-based scroll — one full loop ≈ 15s at 60fps (`900` frames), not CSS wall-clock animation.
- Catch / deliver: **E** or **A** / **LT·RT** — immediate, no arming.
- While `#prompt.is-live`, picks are scoped to `button.prompt__btn` only (not travel/dossier).

## Office desk (casual sit)

- At **My desk** in the office: **Sit casually** (E / A / click / desk act) costs **0 minutes**, sets `G.you.sitting`, places you in the desk chair, and **keeps the world running**.
- Phone, wire, Vox, panels, and desk acts still work while casually seated; those acts spend their own minutes if they always did.
- Walking stands you up (existing). Floor **Take your seat** (5m) is unchanged for chamber sessions.

## Phone

- Opening the phone still pauses the day (`G.running` frozen via `phoneWasRunning`).
- While the phone is open: locomotion is hard-locked (no WASD / left-stick walk). **Left stick** moves the UI cursor among phone controls; **A** / click confirms.


## Phone pad navigation

| Input | Action |
|-------|--------|
| **X** | Open **Day** schedule (today's sittings, in time) |
| **Y** / View | Open / close phone |
| **LB / RB** | Walk phone apps (Day · House · Vox · Post · Mail · The count). On **House**, first walks dossier tabs, then neighbouring apps |
| **LT / RT** | Same as LB / RB while the phone is open |
| D-pad / left stick | Move among phone buttons |
| **A** | Confirm highlighted button |
| **B** / Esc | Put the phone away |

Accept / Decline on Day updates RSVP the same way as the morning briefing.
