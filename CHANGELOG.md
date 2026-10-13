# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

## 20261013a: the chair you won

On `20261012d`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. Only duties and responsibilities were added: no new rooms, meshes or rendering, and nothing on the boot, save or walk path.

- **You take the office you win.** Winning the Governor's chair, the Senate, the Executive or the bench now ends with an oath card that lists that office's duties. Your title changes everywhere: the top bar ("Governor of Nieuw Oranje", "Senator from ...", "President of the Union", "Justice of the Court"), the service record, the standings, the office card and the pause menu. You give up the House seat and any House post (the caucus fills it), you stop voting House roll calls (no "absent" penalty), the whip prompts stop, and the old office is renamed "Old House Office". The election card says what happened ("You won the Governor's chair.", "You held the Senate.", "You lost the race for ...").
- **Your desk moves with you.** The oath walks you to your chamber (the State House, the Senate Chamber, the Executive Wing or the Court), and "Start the day" takes you there if you woke in the old House office. That room's desk has everything the House desk had: the docket, mail, the war chest, the phones, ten minutes with the door shut, "finish here for the day", the powers of the office and the sitting. The NOW line, compass, inbox and end-of-day prompts point to it. The map tags it "Your desk".
- **Each office has its own duties, every working day.** A docket of three or four items, each with two or three choices that cost or pay standing, influence, approval, money, unrest at home or relations abroad; some come back days later. Unanswered items go stale and cost you.
  - *Governor:* statehouse bills to sign or veto, the state budget (works, lean or balanced; the legislature answers a week later), weather emergencies and the Guard on stormy days, clemency petitions, state judgeships, town visits, federal mandate letters (comply, negotiate, or refuse and get sued), meetings with legislative leaders, marches on the capital.
  - *Senator:* every act the House passes comes up for your aye, no or hold; confirmations; treaties at two thirds; committee hearings; filibuster and cloture fights; appropriations for your state; weeks at home.
  - *Executive:* acts to sign, veto or sign with a statement; nominations to the Court (the Senate confirms a few days later); cabinet posts; cables from the realms; executive orders, or the same thing sent to the House as a bill; pardons; the Union's budget; the Speaker; addresses to the nation.
  - *Justice:* petitions to grant or deny, recusal from your own state, the conference vote, opinions assigned to you and written over three drafts before they are handed down and set precedent, emergency stays, law clerks, invitations a judge should refuse.
- **The day fits the office.** Morning card, aims and diary are the office's: clear two items from your desk, hold that chamber's sitting, and one more (governor at home, senator with House members, Executive at the Press Gallery). Diary events: agency meetings and ribbon cuttings, Senate party lunches and mark-ups, cabinet and press briefings, the Justices' conference.
- **Terms run their length.** A Governor or Executive serves two Congresses, a Senator three, a Justice four. Mid-term, the ballot offers "Serve out your term" (the House votes around you) or giving it up to run for something else. When the term is up you stand again as the incumbent: entry requirements waived (term limits still bind), and an easier race.
- Pause menu: a new "The docket" row for holders of a higher office.
- Tests (headless, `?safe=1`): win the governorship → oath → State House desk; docket clearing; aims; diary; mid-term ballot; House roll call with no penalty; Justice petition → conference → three drafts → ruling; Senate votes on House acts; Executive signing, nominations and bills sent to the House; real sleep/morning cycles; save and Continue keep the office and desk.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261013a`. Five HTML copies byte-identical.

## Stalls and boot freeze

On `20261012c`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. The House and its procedures are unchanged.

- **Fewer shader programs:** indoors there are now always the same number of room lights (unused slots are dark placeholder lights), and outdoors none. A material compiles once for indoors and once for outdoors instead of once per room's lamp count. Programs after a full tour: 77 (was 78 on c, with the extra rooms now covered; per-room recompiles gone).
- **Warm-up under each room's lighting:** every material is compiled for both lighting shapes in small idle pieces, each piece compiling only its own objects. Before a frame draws something new, its shaders are compiled in budgeted slices (about 140 ms each) instead of one long freeze.
- **Boot freeze:** the 1.6 s start freeze came from prefiltering the reflection map and from reading back painted textures from the GPU. Reflections now use a small painted cube map (same soft room look on metal and glass), and texture canvases stay on the CPU (`willReadFrequently`). Longest start stall now about 0.6 s (m about 0.65 to 0.8 s).
- **Character-creation lights** leave the scene entirely when not in use, so every shader carries two fewer lights.
- Tests: suite, stress (alone), long run, dialogue, pad sweep, k/l harnesses, the feature harness; stall, crowd and walk A/B against `20261011m` with alternating runs.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261012d`. Five HTML copies byte-identical.

## Grass, seams, East Steps

On `20261012b`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. The House and its procedures are unchanged.

- **Grass:** the District's verges are planted with instanced grass tufts (1,400 on Best, 600 on Balanced, none on Simple), drawn in one call, each tuft its own shade, bending in the wind in the shader. The wind follows the weather like the trees.
- **Seams:** trousers have a side seam down each leg and jacket sleeves a seam line along the forearm, in a darker thread of the suit's own colour.
- **East Steps:** the facade wall, ashlar, columns and paving are a clearly darker sandstone. It had stayed near-white because the sun hits that wall head-on; the stone is now dark enough to read under it.
- **Talk:** the neutral reply that kept saying it was "writing it in the notebook" now has ten siblings ("Hm. I will want to see that in writing before I say a word.", "That is news to me. Who told you?", and others), so the line comes up a tenth as often.
- **Starting up:** after the surfaces are built at the title screen, the shader programs they need (including the skinned versions people use) are compiled one per idle moment, so fewer of them land on the first frames of play.
- Tests: suite, stress (alone), 365-day long run, dialogue, pad sweep, k/l harnesses, the feature harness; crowd and stall A/B against `20261011m`.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261012c`. Five HTML copies byte-identical.

## 20261012b: faces closer, fabric, hair cards, wind, street edges and shopfronts

On `20261012a`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. The House and its procedures are unchanged.

- **Faces, closer:** irises have a pattern now (fibres from the pupil out, a lighter collarette, a dark limbal ring). Lower lids and a lash line frame each eye. Nostrils, a philtrum, a cupid's bow and a dark line between the lips give the nose and mouth their shape.
- **Clothing:** suit and shirt fabric shows creases, seams and a little lint in how it catches the light (Best and Balanced).
- **Hair:** strand cards at the back of every cut, and at the sides for longer styles (Best).
- **Wind:** tree canopies sway, more in wind, rain and storms.
- **The street:** curbs and gutters along both sides of the road and cracks in the sidewalks. Shops have a cornice, a plinth, pilasters, window sills and lintels.
- **Brightness:** the Statuary Corridor walls are warm plaster instead of glare white; the East Steps paving is stone-toned to match the sandstone wall.
- **Rain** is denser (650 streaks, 900 in a storm) with the darker second sheet stronger, so it reads at the Steps.
- **Talk:** when someone picks up a word from the line before, it is now a noun (the word after "the", "a", "your" and the like), names keep their capital, and a clipped "Noted." is folded into the reply.
- **Fixes:** a holder of a Senate, Court, Executive or Governor's seat no longer also sees the visitor's option at the desk. Surfaces are now built in small slices while the title screen is up, so the first walk out of the office no longer pays for all of them at once.
- Tests: suite, stress (alone), 365-day long run, dialogue, pad sweep, k/l harnesses, the 20261012a feature harness; crowd and stall A/B against `20261011m`.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261012b`. Five HTML copies byte-identical.

## 20261012a: people up close, surfaces, transcript, talk, sittings, a capital that runs itself

On `20261011m`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. The House and its procedures are unchanged.

- **People, up close (top priority):** eyes now move: irises and pupils make small saccades and fix on whoever is talking nearby, or on you. Brows are hair, not skin, and carry the mood (knitted when angry, raised when pleased, a lift on emphasis). Lips shape the words actually being said, letter by letter from the line on screen or in the room (open vowels, rounded o/u, closed m/b/p). Older faces get forehead and smile lines; some men show stubble. Skin has a pore map and a faint warm under-glow; every skin tone keeps its own material.
- **Bodies:** each hand has an index finger and a finger group that curl, point and grip (pointing while making a point, gripping a pen while writing, relaxed otherwise). Ties and coat hems swing with the walk and settle when still. People lean into turns, older people carry a slight stoop, some fold their hands when standing idle, listeners nod and turn toward whoever is speaking, and sitting down or standing up is a short movement instead of a cut. All of this runs only within arm's reach (the near band); beyond that the existing distance tiers take over unchanged.
- **Hair:** combed strand texture with a soft highlight band, one shared material per colour.
- **Surfaces:** every plain-coloured material in the game now gets a procedural surface, generated once and shared (paint, wood grain, brushed metal, stone, leather, gloss, glass, skin, asphalt with tire bands and oil, paving with joints), with per-material colour and roughness variation, edge grime and contact darkening. Best uses 256px maps with normals, Balanced 128px without, Simple none. A prefiltered reflection environment (built once from a small procedural room) gives metal, glass, varnish and marble real reflections. Measured texture memory added: about 14 MB on Best.
- **The street:** darker worn asphalt and jointed sidewalks; in rain the street darkens and turns reflective; shop signs glow at night with a reflection on wet ground; three parked cars (two on Balanced) with clear-coated paint, glass, chrome, lamps and a contact shadow, and you walk around them, not through.
- **The East Steps** are sandstone now, not near-white; **rain** has a second, darker sheet of streaks so it reads against a pale sky.
- **The transcript:** every line spoken where you can hear it (in conversation, across a room, in a sitting, and your own words) is written down with who said it, the day and the time. Open it with L, the Log button on the toolbar, or R3 on a controller. Scroll with the wheel, by dragging, with the arrow and page keys, or with either stick or the D-pad; B or L closes it. It keeps the last 500 lines, saves with the game, and does not stop the clock.
- **Talk without repeats:** every line is picked from four drafts against a memory of what the room has heard (exact lines, word pairs, each speaker's own recent words). People keep their own fillers and pet words, answer long with short, and pick up a word from the line before theirs. Over 3,000 lines: distinct lines 82% to 98%, repeated word pairs 90% to 86%, the most-repeated line 20 times to 4. The canon guard still runs last on every line.
- **Sittings as procedure:** the Senate floor, oral argument at the Court, the Executive's morning briefing and the Governor's open hours are now step-by-step sittings: called to order, openings, questions, motions and objections, deliberation, the vote or ruling, adjournment. Lines arrive on a beat and go into the transcript; Continue hurries a line but no step can be skipped. Each step offers a safe choice, a risky one and often a deal or a shortcut, paid in standing, influence, approval, the war chest, pledges on the bill in play and a rival's heat. Rushing costs, reading the file first ("Read the file before you sit", 20 minutes) helps, walking out costs. A new achievement for a prepared, clean sitting.
- **A capital that runs without you:** every member has a goal, allies, enemies and favors owed. Each game hour, off-screen, some of them meet, deal, cosponsor, whip the bill on the floor, file bills of their own and campaign; rain keeps people in and the day's news gets talked about. Their bills go through committee, the House, the Senate, the Executive and sometimes the Court on their own. Caucus posts are elected every ten days. Results show in the Ledger (a new "The capital, on its own" section), the transcript and a laws register, and save with the game.
- Tests: suite, stress, 365-day long run, dialogue, pad sweep and the k and l harnesses; a new harness for the transcript, talk metrics, a full Senate sitting and an idle 50-day run; walk and crowd frame-time A/B against `20261011m`.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261012a`. Five HTML copies byte-identical.

## 20261011m: playability sweep, controller-friendly

On `20261011l`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **People stand where people stand:** the staff of the Senate Chamber, the Court, the Executive wing and the Governor's office now keep to fixed posts in open floor (never inside a desk or a bench), face into the room, and stay put while you work. If the day takes one of them elsewhere, they wander like anyone else and come back to their post.
- **The constituent waits just inside your door,** clear of the side table, so walking up and pressing A (or E) speaks to them and not to the Ledger. When you are looking straight at someone close enough to talk to, they now win over a thing off to the side of your eye.
- **Controller:** B folds the Ledger and closes the map ("Stay here") like any other card. The NOW line and the use prompt say "A" instead of "E" when a controller is in hand. Pause menu, Ledger, Rivals, Home, the powers card from a chamber desk and every constituent choice can all be reached with the D-pad and A, and left with B.
- **The map** lists rooms in walking order, the same as the travel bar, with the new rooms in their places.
- **First-time hints:** the first time you walk into a new chamber, meet a constituent at your office, find the Ledger out, pick up a rival, or step into real weather, the NOW line explains it once, in plain words.
- **Today's aims:** if you hold a higher office, one of the day's three aims is to keep your hours in your chamber, and the compass routes you there.
- **Rain** reads against a grey sky: paler, slightly longer streaks, same number of lines (no frame cost).
- Saved with the game: which hints you have seen.
- Tests: pad-only run through the map, pause menu, Ledger, Rivals, Home, Senate powers card and a constituent visit (hear them out with D-pad and A, back out with B); staff at their posts and still after five seconds in all four rooms; hints and pad wording on the NOW line; chamber aim; rain on the Steps; suite and stress; the k and l harnesses again.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011m`. Five HTML copies byte-identical.

## 20261011l: seasons, households, the Ledger, rivals

On `20261011k`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Seasons and weather:** every day has weather drawn from its season (the game year runs January to December): snow, hard frost, fog, rain, high wind, heat, thunderstorms, overcast or clear, with a temperature, and weather tends to hold for a day or two. Outside on the East Steps and in the District you see it: rain falls in streaks, snow drifts down, fog closes in to a few metres, storms darken the sky. Snow lies on the District sidewalks and builds up over snowy days; the trees and hills turn green in spring, gold and brown in autumn, bare or white in winter. All of it costs one transform a frame (no per-particle work), and none of it changes walking.
- **Weather and mood:** heat and storms take energy in the morning, a clear spring day gives some back, the morning line on the wire tells you what it is like outside, storms and deep snow keep people at home, and a long run of bad weather wears on the households.
- **The households at home:** seven families in your district, each with a street, two adults, a child with news of their own, a need (the bridge on Mill Road, a pension letter, a son's visa hearing) and a mood. Neighbours from those families are out on Main Street on fair days, fewer in rain and snow, none in a storm.
- **Constituents at your door:** on most working days someone from one of those families comes to your office. The NOW line and compass send you there. Hear them out, take it on as casework, ask after the family, or show them out. They remember what you did ("Last time: you asked after Otto. I have not forgotten it."), the next member of the family who comes knows it too, and when the casework comes good the family writes a letter. How the households feel moves your approval a little every night and counts at your next election.
- **The morning Ledger:** a newspaper built each morning from what really happened the day before: the vote, the court, the envoys, your own doings (written about you by name), the feud, a letter from home, the weather and where your approval stands. Pick it up from the side table in your office or from the pause menu ("Today's paper"). The NOW line reminds you in the morning.
- **Rivals with long arcs:** a member who has it in for you starts a feud that runs for weeks in stages: words in the cloakroom, quotes in the Ledger, radio time in your state, working against your bill or your committee seat, money for a challenger in your district (which costs you at the next election), and a reckoning. You can seek a truce, answer them in the press, or dig into their record for the end. It ends in a truce, in you coming out ahead, in them coming out ahead, or with them leaving the House, and then in time someone new takes it up. Two new achievements: Who Blinked and The Diner Booth.
- Pause menu: Today's paper, Rivals, Home.
- Saved with the game: weather, households and their memories, letters, rivals and their history, the day's log for the paper.
- Tests: weather and season visuals in the District and on the Steps (snow, autumn, rain, fog), constituent visit with NOW line and compass, memory, casework letter, paper from yesterday's events, a full rival arc, answer in the press, election swing bounds, save; walking A/B against `20261011k`; suite and stress.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011l`. Five HTML copies byte-identical.

## 20261011k: the higher rooms

On `20261011j`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. The House is unchanged.

- **The Senate Chamber** (north wing, a door on the far right of the Statuary Corridor): a raised rostrum with the presiding officer's chair and the clerks' desk, a horseshoe of sixteen mahogany desks facing it with chairs behind them, an open aisle to the door, a brass gallery rail, columns, flags, sconces and a clock. Two Senators and the Secretary of the Senate work there.
- **The Court** (the old Senate wing, through the Senate's left door): a dais with a long oak bench and five tall chairs, the bar, two counsel tables, a lectern and public seats, columns down both walls and "Equal Justice Under Law" behind the bench. A Justice, the Clerk of the Court and the Marshal work there.
- **The Executive Wing** (a door at the far left of the Statuary Corridor): the Executive's desk with flags behind it, a cabinet table with six chairs, bookshelves, a lamp and a coat stand. The Chief of Staff and an aide work there.
- **The State House** (from the District: a stone building with a portico on the front walk): the Governor's office with a desk over a state map, a secretary's desk at the door, a waiting row, shelves and flags. The Governor's secretary and counsel work there.
- All four are on the map and the travel bar, reached by real doors, and the compass routes you through them. Visitors are welcome; the powers are only yours if the office is.
- **Daily loops:** if you hold the office, the NOW line sends you to your chamber each working day ("Your chair: The Senate Chamber is waiting on you today"), and the desk there opens the powers of your office plus a role act: a Senator takes the Senate floor (+3 standing, +1 influence), a Justice hears oral argument (+2 standing), the Executive takes the morning briefing (the most unsettled state calms, +2 standing), a Governor holds open hours (+4 approval, home state steadier). Once done, the line moves on.
- **The people in those rooms** have their own business: compare notes with a Senator on how the Senate leans on the live bill, read the Senate calendar, pay your respects to the Justice (who will not discuss a pending matter if your state is a party), ask the clerk or counsel about the docket, ask the Chief of Staff for time with the Executive, ask the Governor's office for help at home.
- **Steps plaque:** the "Statuary Corridor" plaque over the steps door sat 35cm in front of the facade. It is now flush to the stone.
- **Inbox flood:** cables from the realms and envoy visits were rolled on a per-frame lane, so the inbox could fill with a dozen cables in a few minutes. They now roll on the game clock (at most one cable per realm every six hours).
- **Speech variety:** 30 new D'Infinite Taylor Consular Neural Organism templates (faith, the anomalies, reactions, state against federal, immigration, foreign). Unique lines over 3,000 mixed samples went from about 54% to about 76%, with no canon breaks.
- Tests: new room test (rooms built and furnished, people seeded, doors and routing, all four role loops), picture audit over 14 rooms, suite, stress, speech sample.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011k`. Five HTML copies byte-identical.

## 20261011j: pictures seated, texture clarity

On `20261011i`. Walk **0.68** / sprint **1.15** kept (fluidity comes from smoothing, never speed). Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Pictures seated in every kit:** every frame and plaque is tagged as it is built, and once a room or kit is furnished (never while you walk) each one is seated: pulled flush to the wall face it hangs on (they stood 3 to 7cm proud), lifted or lowered clear of door headers, picture rails and cornices, stepped along the wall away from sconces and posts, and kept from overlapping one another. Signs with no wall at all (the flag tags in the committee room and district) now stand on two slim brass posts down to the floor instead of hanging in the air. An audit of all ten rooms went from 42 flagged pictures to none hanging, clipping or overlapping; what it still lists are the table nameplates, the statue plinth plates and the outdoor ground signs, which sit where they are meant to.
- **Texture clarity:** textures created while you were walking were held at 2x anisotropic filtering for good, so some walls stayed soft. They are now lifted back to the quality cap (8x on Best) one at a time while you stand still. Nothing changes while walking.
- Frame pacing, camera smoothing (yaw, pitch, lean, eye height), mip chains on every map and MSAA were already in place and are unchanged; speed caps, the 6ms bail, warmAhead and the walk light throttle are untouched.
- Tests: picture audit of 10 rooms, screenshots of seated pictures, idle texture upgrade (and none while walking), walking frame time A/B against `20261011i`, suite and stress.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011j`. Five HTML copies byte-identical.

## 20261011i: career ladder and roles

On `20261011h`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God. The First Consul's seat is sealed and is not on any ballot.

- **Every chair has its own levers:** desk computer "Use the powers of your office" or Pause > Game > Your office. Party leadership sets the calendar and disciplines; a committee chair holds a bill or marks it up toward your lines; a Senator holds confirmation hearings (confirm or make a fight of it), ratifies treaties with the realms and can filibuster; a Governor vetoes the statehouse bill, appoints a state judge, defies a federal mandate (and gets sued) and leads trade missions; the Executive signs or vetoes acts the House passed, appoints cabinet secretaries and sends foreign aid; a Justice rules on state-versus-Union suits, must recuse in cases from their own state or on acts they voted for, and cannot campaign (the war chest stays shut).
- **Out of office is not over:** lose and you are on the East Steps with the session running. From there you can join a member's staff (draft bills for them) or take an envoy's posting abroad (cable home), and stand again at the next election.
- **Term limits are law:** Senate two terms, Governor two, Executive two, House and bench none, held in the law state and shown on the office card. They change only by a voted amendment (new: limit the House to six terms, lift the Senate or governors' limit, a single term for justices; the existing executive amendment now also clears the executive limit). If the law bars every seat you could run for, the ballot offers "Stand down".
- **Members climb too:** at each election a few senior members give up their seats to run for the Senate or a governorship. Winners leave the House (the seat refills under the same election law, creed fresh); losers are last seen on the East Steps. Former colleagues turn up as Senators in your hearings.
- Tests: each role's powers, bench rulings and recusal, judges cannot campaign, limits and amendments, NPC ladder (machine seat and chaplain never leave), stand down, losing continues on the East Steps, members refill to 25.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011i`. Five HTML copies byte-identical.

## 20261011h: bill kinds, war chest, achievements

On `20261011g`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **New fights on the calendar:** immigration (harvest visas, the border guard, naturalization), foreign aid and arms abroad (each tied to a real realm and its envoy), and the states against the Union (unfunded mandates, preemption). About a third of bills are now one of these, each with its own title, who it helps, who pays and why it was filed.
- **Consequences arrive later:** two to eight days after the roll call the wire reports what happened. Harvest crews do not come back; naturalization classes fill; a realm sends grain at cost or recalls its attache (realm relations move); a state's attorney general sues, the circuit court rules, a governor thanks the members who voted no by name. Your approval moves with how your vote landed at home, and state unrest moves with the outcome. A state suit opens a case for the bench.
- **The war chest does things:** desk computer "Open the war chest ledger" or Pause > Game > War chest. Ads (approval now and field), a district office (a little approval every day), legislative aides (influence every morning, up to three), field operations (counts on election day), backing an ally's campaign (adds to their margin at the polls and they remember it), counsel (halves the next suit or mandate hit), a poll (reads six members and home's view of you), and East Steps press time (standing and approval). Field and backing feed the election itself.
- **Achievements:** 19, visible and hidden (??? until found), with a toast when earned and a list in Pause > Game > Achievements. They cover the whip, cosponsors, your own bill, the war chest, the three new bill kinds, re-election, losing and carrying on, higher office, night happenings, anomalies, reception into a creed, coming home to the Latin Rite, smashing a Consular idol, letting ten colleagues talk, thirty days served. None praise any comparison to the First Consul.
- Tests: bill kinds and share, consequences queue and wire, realm relations, chest spending and daily effects, ally backing, achievements card and pause rows, election consumes field and backing, save/load.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011h`. Five HTML copies byte-identical.

## 20261011g: DTCNO speech

On `20261011f`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM, no network. God is the Most High; Christ is King; First Consul is a man under God.

- **DTCNO (D'Infinite Taylor Consular Neural Organism):** the House's own speech engine, an in-world construct of the Consular Rite (a machine, not a deity), running entirely in the page. An embedded lexicon of 1,820 lemmas (3,304 surface forms) tagged by part of speech, topic (bills, immigration, foreign, states and the Union, faith, district, family, money, weather, gossip, the House, anomalies) and sentiment, with openers and closers by register (plain, formal, Latin) and by regional dialect (Dutch, Yankee, Midlands, prairie, delta, high plains, mountain, Pacific). 86 phrase templates by intent, an order-2 Markov recombiner over them, and the existing local net steering warmth and heat.
- **Conditioned on the speaker:** sentience topic, pulse, creed, home dialect, how they feel about you, memories and the bill on the calendar. Each member grows an idiolect (favourite words, register, recent lines never repeated) that is learned as they talk and saved with the career.
- **Where you hear it:** ambient exchanges between members (overheard), a reply after you pick a talk option that follows the tone of what you chose, and a new "Let them talk" option. Text-to-speech reads it through the existing voices. Talk options all still work as before.
- **Guards:** every line passes canon filters (no divine language for any person, no comparison to the First Consul, the hymn and 7/7 stay internal) and a fourth-wall filter (nothing about the real author or kin). Composition never runs while you are walking; about 0.03ms per line.
- Size: about +39KB.
- Tests: 3,000 generated lines with zero canon or fourth-wall breaks, per-line cost, idiolects learned and saved, talk replies and "Let them talk", suite and stress.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011g`. Five HTML copies byte-identical.

## 20261011f: lives of their own, anomalies, faith

On `20261011e`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Lives of their own:** every member keeps a journal written from their memories, dreams at night, and carries a long aim they act on unprompted: filing a bill of their own (it joins the calendar queue), forming a named bloc with allies, befriending someone across the aisle, starting a feud (rivals), deepening their faith, or slowly noticing the shape of their world. At most two social acts reach the wire per night. "Ask what has been on their mind" reads it back to you.
- **Night happenings:** some nights something changes in your office (chairs moved, the lamp left on, a cup that is not yours, a page turned, the flag refolded, a note). You find it the first time you stand in the office the next morning.
- **Anomalies:** rare, saved and discoverable. A member remembers a roll call on a bill that never existed; a letter arrives dated tomorrow; the whip count lists a name nobody knows for one day; two members dream the same dream; and once, a member who has been noticing writes to ask whether you were placed here rather than elected. Nothing is ever answered. The Notebook (Pause > Game) lists them as ??? until you find them, plus happenings, faith on the wire and the blocs.
- **Faith:** choose your creed at the oath (the Consular Rite is not offered there). In the world, read the parish notices at the district church, talk with their clergy to begin instruction, and come back another day to be received. Kneeling at the bronze still joins the Consular Rite (Latin heresy; the chaplain never gives the Host); a confession across the street brings you back. Chaplain and machine seat are never recruited.
- **Organic faith:** each state keeps its established creed as a pocket, and shares drift by night from members' devotion and doubt, neighbouring states, friendships and rare revivals, with a soft cap so nothing snowballs (60 simulated days: no creed above 62% anywhere). Members convert, lapse and return on their own; creed still does not vote and is not inherited on a vacancy.
- Tests: 60-day faith/life simulation, parish instruction and reception, notebook, save/load, real night; suite, people, whip, pause, two 10-day stress runs.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011f`. Five HTML copies byte-identical.

## 20261011e: whip count, cosponsors, bill queue, office desk

On `20261011d`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **The whip count:** a new card (desk computer "Open the whip count", or Pause > Game > Whip count) shows the projected ayes and noes, how many your side still needs, who is pledged with you, and who is worth working, with each member's lean and the room they are in. "Find" sets a whip target: the NOW line reads "Whip: find X in Room", the compass routes there, and talking to them clears it. "Talk now" opens the conversation if they are in the room with you.
- **Cosponsors:** with your own bill on the calendar, the whip count lists everyone in the room with "Ask to cosponsor". Odds come from their lean on the bill, their warmth to you and whether you are allies. A yes pledges them and lifts your standing; a no is remembered.
- **Your drafts queue:** drafting a bill (desk or proposal) no longer erases the live bill. It is filed and goes on the calendar after the current roll call. The queue is saved.
- **The floor sits in its hours:** "The floor is sitting. Go in." and the compass to the floor now only appear while the House actually sits (11:00 to 12:36 and 14:00 to 17:00 on session days).
- **New daily aims:** "Work someone leaning against you" and, with your own bill live, "Sign up a cosponsor".
- **Office desk:** the member's seat was inside the desk (the camera sat in the desk, so it looked missing). You now sit in the chair behind it, facing the room, and E reaches the desk computer from the seat. The desk top is laid out so nothing clips: laptop, blotter and papers, phone, coffee pot, pen cup, one desk lamp standing on the desk (lamps used to sink into the top). The chair is tucked in.
- **Office shelves:** the bookcase was a solid slab hiding its own books; it is now an open case. The "conviction shelves" were a plain block hovering 10cm off the floor; now a grounded bookcase. Press-room rope posts hovered 5cm; now planted on bases.
- Tests: new whip/queue/cosponsor/floor-hours test, desk test (seat behind desk, desk computer in focus from the seat, nothing sunk into the desk, no solid-slab shelves), floating-prop audit of 9 rooms, people test, suite, pause, aims, two 8-day stress runs.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011e`. Five HTML copies byte-identical.

## People: whole bodies that walk (11 Oct 2026) — `20261011d`

On `20261011c`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. Full people meshes, never dummies. God is the Most High; Christ is King; First Consul is a man under God.

Reported from real hardware: "the people aren't moving", suits in pieces, hands and shoes apart from bodies, headless figures.

- **Bodies whole again (root cause):** `renderer.info.autoReset` was off. Three r128 only advances `info.render.frame` on reset, and it gates `SkinnedMesh` `skeleton.update()` on that frame, so every skin (torso, sleeves, legs, neck) was computed once and never again. The skin stayed where and how each person was first drawn while the rigid parts (jacket, hands, shoes, head) followed the live bones: bodies left behind in doorways, sleeves and legs missing, hands and shoes floating. autoReset is back on; skins follow their bones every frame.
- **People walk:** `wander()` ran from a 13-lane House drain (about once a second) with its step capped at 0.022s, so a stroll covered about a centimetre a second. Feet now run every sim step (`wanderFrame`); the drain keeps only minds (approach, sentience).
- **Everyone is posed:** `animateCrowd` posed only the first two people in the list each frame; the rest kept stale poses and never turned to face where they walked. Now near, walking and talking people are posed every frame and the rest on a fair rotation, each with their own elapsed time. Leaving a seat clears the seated-only offsets.
- **Nobody sits on air:** a break could set `sitting` with no seat, folding the body in mid-air for good. Breaks now walk to a free seat in the room (or stay standing) and stand up when the break ends; stray seatless sitting is cleared.
- **Crowd freeze kept true:** freezing bakes every local matrix first; a frozen body that moves is carried whole; thaw refreshes world matrices; far walkers re-snap on a 4-frame cadence instead of every frame.
- Tests: new people check asserts no stale matrices after walking, people wander over 20s, every near body intact with head on, everyone near posed, nobody sitting on air, GPU skins updated this frame.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011d`. Five HTML copies byte-identical.

## Gameplay: daily aims, controller pause menu (11 Oct 2026) — `20261011c`

On `20261011b`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Daily aims:** every morning sets three aims drawn from the day itself: talk with three members; win a pledge on the live bill (someone you spoke with today, pledged your way); be on the floor for the roll call when there is one (or sit in on the floor); and one place (district, Caucus Room, Cloakroom, East Steps) or clearing the inbox. Shown on the morning card, the NOW line ("Today 1/3: ..."), the pause menu and the night card ("Aims: 2 of 3 met"). The compass and route follow the next aim when nothing is more urgent. Each aim met gives a small, specific gain (influence, standing or approval) and a feed line; all three give a little more. Aims save with the career and never point at the Consular path.
- **Controller:** radial deadzone on both sticks (diagonals stay diagonal, drift dies) and a gentle look curve for fine aim. Start opens and closes the pause menu; in it the D-pad or stick moves between controls, A presses, left/right nudges sliders, LB/RB change tabs, B resumes.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011c`. Five HTML copies byte-identical.

## Feel: pause menu, objective route, 10pm fix (11 Oct 2026) — `20261011b`

On `20261011a`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Pause menu that works:** Esc (or Settings) pauses the game and opens one menu with four tabs. Game: pace 1x/2x/4x, Save now, Handbook, Title menu, today's line. Graphics: Best / Balanced / Simple, film grain, seated poses. Voices: on/off, volume, rate, carry. Controls: look speed (mouse, A/D, right stick), invert Y, controller status, Rebind keys. Walking stops while paused; pace is restored on close. Esc no longer closes and reopens in the same press.
- **Route to the objective:** the NOW line adds "> Room, then Goal" (shortest hop through the doors); the compass shows a gold goal marker on the next door, pinned to the edge when it is behind you.
- **First minutes:** key hints stay up for the first 45s of a new career (or until the first door).
- **10pm Continue soft-lock fixed:** a save made at 10pm resumed with the night pending and no card; it now resumes a minute before and the night card comes.
- Saves keep invert Y and voice volume. HUD clears the top bar when bare. Settings tabs sized for touch.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011b`. Five HTML copies byte-identical.

## Playable fixes: corridor freeze, elections, warmAhead (11 Oct 2026) — `20261011a`

On tip `20261005a`. Walk **0.68** / sprint **1.15** kept. Full people meshes kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

Found with a headless boot-to-play harness (new career, every door walked, talk in every room, vote, Sleep, save/reload/Continue, election).

- **A. The corridor freeze:** `alignment()` -> `stakeSway` -> `stakeIn` -> `alignment()` recursed to the stack limit, then fanned out through `tiePull` across every tied member. Once ties formed the main thread hung for minutes (reproduced: page unresponsive >4 min after entering the corridor). `stakeIn` now reads raw ideology; `alignment` has a re-entrancy guard and a short per-frame memo.
- **B. Elections never ran:** the card watchdog hid any card without a `.card__actions` button, so the ballot ("What are you standing for?") vanished on the next frame and the term rolled on. Any live control now counts; a control-less card gets 2.5s grace (Sleeping... / Loading...).
- **C. warmAhead never ran:** `roomGroup` was `const`, so the first kit swap threw and `_warmBusy` stuck forever. Now `let`; the kit isolates lamps/tickers and never touches the live sky; shells stash as shells (no child-count "furnished" guess). Rooms after the first get their practical lamps again (`ROOMLIGHTS`/`TICKERS` relink on stash/take).
- **D. New career is safe:** with a career on disk, New career asks first (Back is the default); the old save is only wiped when the new oath is taken.
- **E. Standalone file://** skips the `/tex/*.jpg` probe (CORS noise); canvas maps stand.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011a`. Five HTML copies byte-identical.

## Weekly MAX OPTIMIZE + design/max-fit (5 Oct 2026) — `20261005a`

On tip `20261001b` (hard shadows on the 01a freeze). Walk **0.68** / sprint **1.15** kept. Full people meshes kept. `PEOPLE_CAST_SHADOW` false. `history.replaceState` only. God is Most High; Christ is King; First Consul is a man under God.

- **A. Deep crowd freeze while walking:** culled (behind / `d2>25`) and far (`d2>12`) people traverse-freeze `matrixAutoUpdate` (suits/faces/hair no longer pay per-frame matrices). Near keep soft follow + pose-only. No dummy people.
- **B. Best `BasicShadowMap`:** one sample, no PCF filter taps (01b already shrank maps). Shadow refresh still skipped while feet move.
- **C. Walk light throttle:** `updateLighting` / motes / fan every 8th draw while `spd>0.12`.
- **D. Max-fit shell:** `.shell` `max-width:min(2560px,100%)`; wide breakpoint denser grid/plates so GamingDesktop fills; kit cap KEEP **MODEST 6 / else 8**.
- **E. Design polish (canon):** tighter Caesar fringe (not a lump); wider side-part scalp gap; grounded furniture contact pad 0.68.
- Stamp: meta + STAMP + `ONUM_BUILD` → `20261005a`. Five HTML copies byte-identical.

## Hard shadows on the 01a freeze (1 Oct 2026) — `20261001b`

On tip `20261001a` (far-crowd freeze / kit reuse / 6ms bail). Walk **0.68** / sprint **1.15** kept. Full people meshes kept. `PEOPLE_CAST_SHADOW` false. `history.replaceState` only.

- Keeps the `20261001a` far-crowd freeze, kit reuse, and 6ms frame budget bail.
- **Best hard shadows:** drops soft 1024 shadow maps for a harder smaller shadow (fewer map pixels).
- Stamp: meta + STAMP + `ONUM_BUILD` → `20261001b`. Five HTML copies byte-identical.

## MAX OPTIMIZE frame/kit/crowd (1 Oct 2026) — `20261001a`

On tip `20260929a` (second mind beat; room build waits if frame already heavy). Walk **0.68** / sprint **1.15** kept. Full people meshes kept. `PEOPLE_CAST_SHADOW` false. `history.replaceState` only.

- **A. Far crowd freeze while walking:** beyond near (`d2 > 12`) but inside existing cull (`d2 ≤ 25`, facing): snap pose, `matrixAutoUpdate = false`. Near keep soft follow + pose-only. Never dummy people.
- **B. Kit reuse:** warmAhead / takeRoomKit heal shell+furnished flags from children; skip rebuild when dest kit already furnished; re-`freezeStaticRoom` after taking a furnished kit (Sleep stays a clock).
- **C. Frame budget hardening:** `framePaidMs` / `frameOverBudget(6)` — warmAhead shell/furnish, renderRead sync/warm, and drainHouseOne bail early if the beat already paid (~3.5ms premise / 6ms frame). One unit of work max.
- Texture walk anisotropy cap ≤2 kept from `20260928a`.
- Stamp: meta + STAMP + `ONUM_BUILD` → `20261001a`. Five HTML copies byte-identical.

## Second mind beat (29 Sep 2026) — `20260929a`

Keeps the 28a door drip and walk texture cap. Lives get a second cheap tick when premise still has budget. A room build that costs more than 6ms waits (`_warmSkip`).

## Stream-drip warmAhead (28 Sep 2026) — `20260928a`

First corridor door still the heaviest (~0.8–1.4s). Kits make the second pass cheap. Full people meshes kept. Walk **0.68** / sprint **1.15** kept. `PEOPLE_CAST_SHADOW` false.

- **A. Stream-drip `warmAhead`:** while walking (`playerMoving`), warm **shell-only** for the nearest door dest into a kit; while standing, may furnish one kit (`buildRoomInner` + tidy + freezeStaticRoom). One phase per call. Prefer corridor when choosing / culling kits. Deferred `warmAhead` after `begin()` shell (non-blocking).
- **B. Texture walk cap:** newly created canvas textures (`texCanvas`) cap anisotropy at **2** while feet move; Best/fullDetail still get mips. No full-texture traversal on walk start.
- Stamp: meta + STAMP + `ONUM_BUILD` → `20260928a`. Four HTML copies byte-identical.

## Walk-freeze rigor (22 Sep 2026) — `20260921e`

Freeze after seconds–minutes of walking (main-thread hitch). Walk **0.68** / sprint **1.15** kept. Full people meshes kept.

- **A. Save never blocks a walk frame:** `queueSave` / 45s autosave abort if `houseQuiet()` or `playerMoving()`; `save()` strips meshes in batches of ~5 via `requestIdleCallback`/`setTimeout(0)`; `JSON.stringify` off the walk tick; `beforeunload` may sync-save once; visibility-hidden queues only if !moving.
- **B. No deferred dump on stop:** after walk, `drainHouseOne` runs one AI subsystem per frame for ~1s (`sentWorld`/`clockRoom`/`crowdWatch`/`voxTick`/`autonomyTick`/`consularBody`/`realmTick`/`agiStep`). `syncPeopleStaged` coalesces waiters; full `syncPeople` only after staged retry cap.
- **C. Render while moving:** pose-only crowd, no people cast shadows, skip `shadowTick`, dip PR, force `shadowMap.needsUpdate=false`, skip plates/track/tele, feed rarer; `kickFrame` 1.5s watchdog will not kick if `saveBusy` / `_buildingRoom` / door fade.
- **D. Memory:** remesh disposes old geometry/materials; corridor people cap MODEST 6 / else 8; MODEST Best stays PCF 512; `PEOPLE_CAST_SHADOW` false.

## Move-frame opt (22 Sep 2026) — `20260921d`

While walking (`spd > 0.12`): skip shadowTick, plates/track/tele, matChk; animateCrowd pose-only + hide far/behind (`d2>25` or back); brief PR dip MODEST≤0.95 / else≤1.1 then restore. Best still no people-cast; MODEST Best PCF 512 + PR 1.15. Walk 0.68 / sprint 1.15 unchanged.

---

## Play this build

| | |
|---|---|
| **Grok.me (canonical)** | https://onenationunderme.grok.me/ |
| **GitHub Pages** | https://dominicvii.github.io/the-long-session/ |
| **raw.githack** | https://raw.githack.com/DominicVII/the-long-session/main/index.html |
| **jsDelivr** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |

**Build stamp: `20261005a`.** Saves live in the browser (`localStorage`). Continue never deletes a career. Sleep is a clock, not a 3D rebuild.

This is the actual working log of the published HTML — not a Claude artifact.

Full older entries remain in git history and on the box at `/workspace/the-long-session/CHANGELOG.md`.
