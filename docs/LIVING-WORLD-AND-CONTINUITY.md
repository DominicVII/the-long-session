# Living world and social continuity — requested scope

This document records the requested next implementation scope. It is a design/acceptance brief, **not a claim that these systems are already implemented**. Preserve existing game systems, save data, canon, and the five synchronized playable HTML copies when implementation begins.

## Non-negotiable behavior

- People remain individuals. Do not assign new behavior as a compulsory trait or force new activities into every career. A person may choose a behavior when their own traits, relationships, circumstances, schedule, and opportunity make it plausible; they may also choose not to act.
- Events enter the record only when they actually happen in the simulation. Separate witnessed facts, attributed accounts, rumor, and unknowns. Historical precedence means respecting established in-world events, dates, offices, family ties, and causes—not inventing a real-world history for the fictional republic.
- Preserve player choice. No forced social encounters, extra resource/point system, or irreversible actions without the established choice and record.
- Simulate on the game's clock and meaningful time steps, not every rendered frame. Keep offline play, performance, existing saves, and current controls.
- Social ties and memories are durable: relationships may grow, cool, or break through what people do and remember. Do not preassign friendships, feuds, marriages, or family connections.

## Social life, families, and the growing record

1. Let characters, when circumstances permit, initiate or decline ordinary social actions, relationships, courtship, marriage, births, work, leisure, entertainment, sport, and creative activity. These are possibilities, not a checklist each character must complete.
2. Record consequential events with stable IDs, day/time, people involved, place, cause when known, witnesses/sources, and certainty. Preserve family links, births, marriages, deaths, and meaningful relationship changes in a readable family/history record.
3. Let public and private memory differ. Some people keep journals, letters, photographs, or other records; other events leave no surviving document. Never silently turn an undocumented event into confirmed public history. Allow records to be incomplete, disputed, or lost where the simulation supports that outcome.
4. Allow music, performers, teams, sports, and celebrities to emerge from people's choices, skill, interest, opportunity, and public response. Do not create a celebrity or team merely to fill a panel.
5. Feed recorded events into later conversations, relationships, local reporting, and political life only when a character plausibly knows of them.

## District autonomy, commerce, markets, and currency

- Keep district life moving without the player: households, residents, employers, shops, local services, and public activity make bounded decisions on game-time ticks.
- Establish actual businesses with stable owners, workers, locations, hours, stock, supply costs, wages, cash, posted prices, and customer/reputation history. Businesses in the same category compete; characters may shop elsewhere based on availability, price, quality, proximity, schedule, and preference.
- Bind the shared market to a common price basis for equivalent goods. Individual storefront prices may diverge for recorded reasons (costs, shortages, taxes, quality, or deliberate pricing), not contradictory arbitrary prices. Purchases, wages, and transfers update the appropriate person's or business's own funds and ledger.
- Add a stock market as a simulated institution: named issuers, shares, prices, volume, ownership, and a traceable price history driven by recorded conditions. Clearly distinguish quoted value from realized proceeds; buying and selling have consequences and are not free money.
- “Real time” means responsive to the running simulation clock, with visible last-updated time and a pause/phone policy consistent with existing game behavior. It must not depend on wall-clock time, a server, or external financial data.
- Currency has an explicit denomination and exchange/value history where the setting supports it. Any exchange-rate change must be caused by recorded conditions and shown in the ledger; avoid unexplained inflation or price jumps.
- Do not simulate every item or transaction every frame. Bound the number of active businesses, people, and events processed per tick and persist only consequential state.

## Vox on the phone

- Make the phone's Vox view show the same current feed as the Vox surface, including the player's exact authored post and replies, in chronological order with clear attribution.
- Keep the existing free-text rule: do not normalize, censor, or rewrite player text. The same post should not fork into inconsistent copies across phone and Vox. Preserve reply, scroll, and close behavior, including keyboard/gamepad access.

## World and nation maps

- Retain the existing map filters and connect them to a coherent continental world map and a geographic national map. Show coastlines, landforms, borders, settlements, routes, and named regions in consistent relative positions and scale; the fictional geography should be internally accurate to established lore rather than falsely presented as Earth geography.
- Keep map labels, district names, and destinations consistent with the world and existing records. Filters change visibility, not underlying geography or state. Make map views readable on narrow screens and usable with current controls.

## Cabinet appointments and executive work

- A cabinet seat is a real, named secretary's position with a corresponding office/workplace and duties. Candidate eligibility and the secretary's record must come from established game state; never invent a predecessor or claim a real-world person exists in this fictional setting.
- Expand the appointment process beyond an interview and nomination: establish the vacancy and authority, candidate's qualifications and record, consultation/hearing and questions, nomination, deliberation, confirmation or denial, appointment paperwork/oath where applicable, transition, and first work in the department.
- Acceptance and rejection both create detailed, attributable records and follow-up consequences. Preserve the player's decision points and existing constitutional procedure; do not make a nomination automatically successful.

## Interaction reliability: desk and executive cabinet table

The reported defect is that the desk prompt appears and vanishes, leaving no reliable alternative for desk or daily actions; the executive-office cabinet table prompt also disappears and its interaction does not work.

Acceptance checks:

1. Desk and cabinet-table focus remains stable while the player is in valid range and looking at the object; a transient prompt must not be the only way to activate either interaction.
2. Provide an equivalent persistent access path through the existing menu/phone or room action list, with keyboard, mouse, and gamepad support.
3. One activation opens the correct desk or cabinet action surface; closing it restores the prior room/activity state. Avoid duplicate handlers and ensure the object and prompt refer to the same target.
4. Test entry, approach, look away/look back, prompt refresh, activation by each input method, close/reopen, room transition, and save/continue. Confirm no action is lost when the prompt rerenders.

## Suggested delivery slices

1. Reproduce and fix desk/cabinet-table access; add a stable alternate interaction path and regression checks.
2. Show the existing Vox feed consistently in the phone.
3. Build the shared event/history and relationship continuity foundation, then let autonomous social choices create only events that actually occur.
4. Connect a bounded district business simulation to individual money, shared price basis, competing storefronts, and auditable transactions.
5. Add the market and currency history on the same simulated clock.
6. Add the staged, recorded cabinet appointment workflow.
7. Upgrade world/national maps while retaining filters and validating against established geography.
8. Expand emergent creative, entertainment, sports, family, and public-memory outcomes using the same event/relationship record.

## Shipping and regression requirements

- Keep `session.html`, `index.html`, `One Nation, Under, ME.html`, `public/session.html`, and `session.standalone.html` synchronized byte-for-byte when playable HTML changes; update the build stamp and publish the same behavior to each copy.
- Preserve current world systems and user data. Provide safe defaults when older saves lack newly introduced fields.
- Verify offline launch, fresh and continued careers, phone Vox, district and map filters, market ledger, cabinet acceptance and denial, desk/table keyboard-mouse-gamepad interactions, and long-session performance before describing a slice as implemented.
