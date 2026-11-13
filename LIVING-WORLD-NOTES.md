# Living World, Continuity, Markets & Maps — Design Notes (20261113)

These notes capture the requested push for social continuity, organic lore, living districts, real-time markets, detailed maps, cabinet immersion, and related systems. They are the design law for the next layers. Do not add new cardinal types; the seven already on the record stay the seven.

## Social Continuity & Memory (CK3-like, but organic)

- People are who they are. No new "cardinal sign types." The existing seven districts, cultures, and individual traits are sufficient. Characters act from their traits, history, relationships, and choices.
- Memory is real. What people remember is what actually happened in the career: conversations, votes, favors, insults, shared meals, births, marriages, deaths, scandals. Some write it down (journals, letters, Vox, newspapers, church records, family Bibles). Most do not. Only what is recorded survives if the person dies or leaves.
- Families form organically. Births, marriages, divorces, adoptions, and inheritances happen off-stage and on-stage. The player may court, marry, have children, or remain single. Relationships matter for standing, secrets, votes, and later generations.
- Lore builds from play. As events occur, the record fills: who married whom, which store closed, which team won the cup, which song was written in a back room, which secretary resigned. Players and NPCs document or ignore as they choose. Historical precedence is binding: a prior decision, treaty, court ruling, or custom is cited and carries weight unless overturned by proper process.
- Celebrities, entertainers, athletes, and creators emerge. Individuals may compose music, form bands, write plays, start sports teams, or become known for skill or scandal. These are jobs and social facts, not separate systems bolted on.

## Districts as Living Worlds

- Each of the seven districts runs itself. Storefronts are actually owned by named characters. Prices are not free-floating; characters are bound to the same price points for goods (bread, cloth, tools, newsprint, fuel). Competition exists: some shops are cheaper, some better stocked, some closed on holy days, some preferred by certain classes or creeds.
- Characters shop according to their means, district, and habits. A Meriden laborer does not buy Fallowfield wine unless the price is right or the relationship is. Supply, demand, weather, tariffs, and events move local markets.
- Sports and entertainment are local and national. Teams have names, owners, players drawn from the population, seasons, and results that appear in the Ledger and on Vox.
- The capital (Nieuw Oranje VII) has denser commerce, more foreign goods, and more prestige trades. Outlying districts have their own cycles.

## Real-Time Markets & Currency

- Currency is real and tracked. Personal money, war chest, district treasuries, and national accounts move with taxes, contracts, sales, wages, and events.
- A stock market exists. Companies (mills, shipping lines, newspapers, defense works, mines) have shares owned by characters. Prices move on news, policy, weather, and foreign relations. The player may buy, sell, or merely watch. Characters trade or hold according to their traits and district.
- Markets are continuous, not turn-based. While the player walks or sleeps, prices, inventories, and ownership continue to tick.

## Maps

- The nation map is a geographically coherent representation of the seven districts: Nieuw Oranje (central capital), Meriden (east industrial), Calder (north agrarian), Riverbend (west mercantile/port), Fallowfield (south traditional), Blackwater (coastal/defense), Kestrel (mountain/isolated). Coasts, rivers, mountain passes, and trade routes are visible. Existing filters (relations, unrest, bread, etc.) remain.
- The world map is a continental-scale representation of the surrounding powers. Coasts, seas, and relative positions are consistent. Color and labels follow the existing relation and decision system. No fantasy continents; the geography is grounded in the Republic’s known neighbors.

## Cabinet & Appointments

- Every cabinet post is a real office with a real person on the record. The process is not a single interview + nomination.
- Steps include: vacancy or resignation, quiet soundings, formal proposal, hearing or private briefing, objections from other secretaries or the House, acceptance or denial with reasons, and public announcement. Denial and acceptance both produce record, Vox traffic, and relationship shifts.
- Secretaries report, argue, and act from their own portfolios and personal histories. The table in the Executive Wing must remain interactable; prompts must not appear and vanish. An alternative path (desk computer or direct action) must exist for daily tasks when the glass prompt is unstable.

## Vox

- All significant public comments appear on Vox. The phone menu shows the live Vox feed. Posts are free-form; the typewriter effect remains. Player posts are exact. NPC posts and replies continue to be generated from traits, relationships, and events.

## Desk & Daily Tasks

- The desk prompt (sit / use computer / stand) must be stable. Clicking or approaching the desk must not cause the prompt to flicker out.
- Daily tasks (role duties, casework, correspondence) remain reachable from the desk computer even if the glass prompt is suppressed.
- The cabinet table in the Executive Office must stay visible and functional once approached; it must not appear and disappear without working.

## Implementation Order (suggested)

1. Stabilize desk and cabinet interaction prompts (glass hold already exists; ensure deskProp and cabinet props arm it correctly).
2. Show Vox feed inside the phone pane.
3. Seed owned storefronts and local price lists per district.
4. Add a simple stock exchange panel (owned companies, price ticks on events).
5. Expand map geometry notes and filter consistency.
6. Deepen cabinet appointment sequences with multi-step records.
7. Let family events, marriages, and celebrity careers write into the existing memory and lore systems.

Historical precedence is already partially present (precedents, office history). Extend it so every major decision can be cited later.

These notes do not add new cardinal types. They deepen what is already on the record.

**Build target:** next letter after 20261113a.  
**Canon:** God is the Most High. Christ is King. The First Consul is a man under God.
