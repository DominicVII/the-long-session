# Seated voice (untimed)

Untimed rowdy picks while **sitting** in a live chamber sitting — **no dwell ticker**.

## When available

`G.you.sitting` + `SEATED_ROOMS` + `PROC.on` + (`PROC.speaker` or phase `run`/`open`/`you`).

Not idle outside session / nobody speaking.

## Acts

Shout · Heckle · Speak mind · Out of hand · Stand — keys **1–4**, D-pad / LT·RT cycle, A/E confirm.

## Lectern cap (session)

At most **2** up in speaking area (`lecternOccupants` / `lecternCapOpen`). Player pushed back via `enforceLecternCapPlayer`. Prompt: *Well full — two already up*.

## Everyone else fixed

Non-speakers: **sit** (`seatRoom`/`seatsFor`) or **back stand** (`backStandsFor`, `m.backStand`). `wander` early-outs during PROC — no milling the well.
