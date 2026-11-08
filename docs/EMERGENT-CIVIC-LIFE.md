# Emergent civic life — implementation brief

This brief turns the requested visual and social improvements into a testable implementation scope for the single-file game. It is not a claim that the features below are already implemented.

## Player-facing goals

- Make people look and feel grounded in the existing Three.js rooms: richer lighting and material response without sacrificing the game's offline, single-file-compatible path or its performance tiers.
- Make a conversation visibly happen between the player and the person addressed. A prompt must belong to a real, nearby person; approaching, facing, and engaging them should make the interaction legible in the scene.
- Make sessions, meetings, caucuses, and party gatherings feel like shared events in the room—not detached menus. Participants should gather around the appropriate furniture or speaker, face one another, react to the floor, and remain individually approachable when the player joins.
- Make the District a place to visit and use: residents, businesses, public services, local issues, and changing activity should give the player reasons to walk around and talk to people.
- Support emergent play through reusable systems and state-driven combinations, not a promise of literally unlimited authored content.

## Interaction and staging requirements

1. Give each social activity a clear owner and state: idle, gathering, in progress, player turn, and concluded. A single activity owns the floor at a time; opening an NPC conversation must not cover or steal an active sitting/meeting.
2. Before opening a face-to-face conversation, resolve the selected nearby actor, validate proximity, and turn both the actor and player toward one another. Keep the existing key/pad actions and accessible on-screen prompt in sync with that actor.
3. Route talk through the existing conversation owner/gating system. The prompt should identify the person and available action; it must not appear when the named actor is absent, out of range, or unavailable because the player is seated in another activity.
4. For gatherings, stage attendees at valid standing/sitting positions around the relevant focal point. During turns, orient the speaker toward the room and let listeners look toward the speaker; when the floor changes, update the focus. Preserve independent NPC interaction outside the formal turn.
5. Keep the player's speech choices and free reply available during the player's turn. Do not advance the session while the player is typing or composing a response.
6. District encounters should be derived from current district, time, local state, relationships, and recent events. Offer conversational entry points and practical destinations (for example, shop, office, meeting, service, or public place), and record meaningful player choices in the existing career history.

## Emergence model

Build small, composable encounter ingredients rather than an ever-growing list of bespoke scenes:

- **Context:** place, time, activity, local conditions, and recent public events.
- **Actors:** present characters, relationships, roles, agendas, and current availability.
- **Incidents:** a local concern, request, disagreement, opportunity, interruption, or follow-up.
- **Choices and consequences:** conversation/action options that update established game state and can seed later encounters.

Select and combine ingredients only when their preconditions are met. Use deterministic seeds where appropriate so a saved career remains coherent. Bound concurrent incidents and ambient updates to protect performance, avoid repeating recent beats, and provide offline fallback. The system should create variety from supported combinations while clearly surfacing the concrete choices it can resolve; it must not imply arbitrary world changes that the simulation cannot record.

## Visual direction and constraints

- Improve realism through coherent scale, contact shadows, restrained ambient occlusion, warm/cool light contrast, and existing procedural material textures.
- Keep visual changes compatible with low/medium/high quality settings, reduced-motion preferences, mobile layouts, and the project's no-CDN/offline launch requirement.
- Do not remove room detail, models, existing activity systems, or player controls as a shortcut. Keep foreground prompts readable against the scene.
- Treat this as a coordinated change: the repository handoff assigns visuals/talk presentation to Neptune and core session/procedure systems to Jupiter. Coordinate changes to the session owner, activity state, or saved career data rather than silently replacing those contracts.

## Acceptance checks

- In a corridor or District, the on-screen talk prompt names the same visible nearby actor that receives the interaction. Moving out of range removes/changes the prompt; it never opens a conversation with a different or stale actor.
- Starting or joining a meeting shows the player and participants arranged around the correct focal point. Speaker changes produce visible listener/speaker attention changes. Typing does not advance the player's turn.
- Opening an NPC chat during an owned sitting does not replace the sitting UI; closing a conversation always restores the correct activity state.
- The District has at least several useful destinations and recurring ambient activity, while interactions remain grounded in state and have consequences visible later in the career.
- Repeated visits vary with time, local conditions, relationships, and recent history without producing contradictory duplicate incidents.
- Smoke-test desktop and narrow/mobile layouts, low and high visual quality, offline launch, save/continue, keyboard and gamepad controls, and a long session for frame-rate or stale-overlay regressions.
