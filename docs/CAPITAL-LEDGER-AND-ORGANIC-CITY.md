# Capital Ledger, district commerce, and civic life

## Purpose

Expand the **Capital Ledger** from a headline panel into the daily public record of a living capital. News, commerce, public life, private lives, and political judgment should be connected by events the simulation can explain. The city should reward walking, noticing, asking questions, entering places, and remembering what people said.

This is a design specification, not a claim that the features below are already implemented. Preserve existing systems and contracts; add these in small, testable increments.

## Design principles

1. **The city has a memory.** A closure, strike, church supper, poor harvest, council decision, or public promise can matter in later days.
2. **Every claim has a source and a reason.** News and NPC implications derive from recorded facts, observations, testimony, or clearly marked uncertainty.
3. **Varied prose, stable meaning.** Wording should change naturally, but the underlying fact must not drift just to avoid repetition.
4. **No unexplained code.** If a person or paper uses a euphemism, image, local saying, or indirect warning, the player can ask what it means and receive a grounded explanation with the relevant evidence and uncertainty.
5. **No omniscient newspaper.** Reporters can be mistaken, partisan, cautious, or incomplete. Distinguish confirmed fact, attributed claim, analysis, rumor, and unanswered question.
6. **A place is usable, not just decorated.** Street labels lead to fixed destinations; doors and interiors connect to people and actions.
7. **Emergence comes from systems.** Compose events from place, time, people, business conditions, relationships, and the player's record. Avoid promising literally unlimited content or inventing consequences the game cannot preserve.

## The Capital Ledger: a complete news organization

### Publication identity and newsroom

Give the Ledger a recognizable masthead, dateline, edition number, district/weather note, and a short editor's note. Model a small organization rather than one interchangeable narrator:

- **Publisher / proprietor:** ownership, debts, printing capacity, and commercial or political pressures.
- **Editor-in-chief:** sets the edition's priorities and corrections policy.
- **Beat reporters:** House and executive, courts and public services, labor and trade, churches and civic associations, neighborhoods, and culture.
- **Copy desk:** checks names, dates, places, quotations, and attribution against the event record.
- **Printer and distributors:** paper, press capacity, delivery routes, price, and delivery delays.
- **Readers and sources:** people with distinct interests, access, memory, and credibility.

These roles can initially be represented as lightweight data and authored personas; they need not all be separate high-cost 3D characters. When someone is present in the world, their schedule, location, and identity should match the newspaper attribution.

### Edition structure

Each edition should select and arrange stories from a shared event ledger:

- **Front page:** the most consequential verified event, a clear headline, a factual deck, and the central unresolved question.
- **House and government:** proceedings, votes, appointments, policy, executive orders, and what changes in people's lives.
- **Districts and streets:** neighborhood reports, local services, road or weather conditions, gatherings, and residents' concerns.
- **Trade and labor:** business openings/closures, prices, supply, jobs, wages, disputes, and negotiations.
- **Courts and public records:** cases, findings, filings, and due process; distinguish allegation from judgment.
- **Church and civic life:** publicly observable services, charitable work, community events, and religious observance, handled respectfully and consistently with the game's canon.
- **Letters / public voice:** attributed reader submissions and replies, with disagreement represented fairly.
- **Market notices and classifieds:** openings, services, notices, public meetings, and work opportunities.
- **Editorial and analysis:** explicitly labeled opinion, with its argument and assumptions visible.
- **Corrections and follow-up:** what the previous edition got wrong, what has since been verified, and what remains open.

Not every section needs a story every day. Empty space is better than fabricated news. The player should be able to open a story for its full article, sources, timeline, related people/places, and links to the relevant in-world location or public record.

### Article record and auditability

Represent a story independently from its wording. A story record should contain:

- stable story/event ID and edition/date;
- headline, deck, article body, section, and editorial stance (if any);
- the underlying event IDs and causal links;
- named author, sources, quotations, and source reliability/relationship where known;
- facts confirmed, claims attributed, unknowns, and disputed points;
- district, business, people, and public-service links;
- follow-up state, correction history, and publication reason;
- wording/phrase IDs used in the article to avoid unwanted immediate reuse.

The player-facing article may hide technical fields, but a **How we know** or **Read the record** action should expose plain-language sourcing. If the story uses a phrase like “snow on Main Street,” the explanation must show which conditions it refers to and whether the phrase is an observed metaphor, a source's words, or the paper's interpretation.

### Newspaper prose that does not repeat

Use a fact-first generation pipeline:

1. Select the event and verified facts.
2. Choose a story angle supported by those facts (human consequence, institutional decision, business impact, disagreement, or follow-up).
3. Select sentence structures and vocabulary appropriate to the named reporter and section.
4. Check recent editions for repeated headlines, lead sentences, quotations, and metaphor IDs.
5. Run a consistency check: dates, names, vote totals, prices, locations, and causal language must still match the source record.
6. Keep the same story stable on re-open; only a new edition, correction, or follow-up may change it.

Vary expression, not truth. Avoid random synonym swapping that changes tone, certainty, or political meaning. Reuse a distinctive phrase only when it is a deliberate callback, quoted refrain, established local idiom, or continuing story. When a phrase has an implication, provide a discoverable explanation and show competing interpretations where warranted.

An article should answer, in ordinary language: **What happened? Where and when? Who is affected? What is known? Who says so? What remains uncertain? Why does it matter politically?** Keep opinion separate from reporting.

## Organic business life in the capital district

### A place-based business directory

Build a fixed street map with named roads, blocks, landmarks, and a directory of actual establishments. Include multiple businesses in the same category so they can compete: grocers, cafés, clothiers, barbers, printers, lodging, transport, trades, and other services that fit the capital. The set should be data-driven so more locations can be added without rewriting the simulation.

Each establishment should have a stable identity and:

- owner/operator and any partners;
- workers, roles, shifts, and wages;
- location, door, sign, interior type, opening hours, and services;
- cash, stock, supply sources, costs, and posted prices;
- reputation, regular customers, debts/credit, and local relationships;
- current pressures such as rent, spoilage, delivery delay, labor shortage, competition, or demand;
- political interests and the evidence behind them (taxes, contracts, trade, wages, regulation, neighborhood conditions).

Give every business a clear reason to exist and a useful interaction. The player can enter open businesses, read posted prices/notices, talk to workers or owners, and make purchases only when the item/service is available and the buyer can pay. Purchases must update the existing money records; never create money or stock without a recorded source.

### Competition and economic causality

Competition should be legible and bounded. For businesses in a shared market, model a small number of factors such as price, stock availability, quality/reputation, convenience, opening hours, and customer relationships. A change in one factor should have traceable effects:

- a delayed shipment reduces stock and may raise prices;
- a nearby competitor with better availability may gain customers;
- a wage dispute can affect staffing, service, and household income;
- a public contract or tax change can benefit some firms and burden others;
- a shop's closure affects workers, suppliers, neighboring foot traffic, and local opinion.

Do not simulate every item in every shop every frame. Update on meaningful time steps or recorded transactions, cap the number of active businesses/events processed at once, and persist the important state. Prices and outcomes should be plausible and explainable rather than perfectly optimized or wildly random.

### From business conditions to political views

A person’s political view should emerge from their lived interests and memories, not from a single static “business type” label. Track understandable influences such as:

- job, income reliability, prices, household needs, and working conditions;
- ownership, contracts, credit, and exposure to taxes or regulations;
- recent local events, public services, transport, safety, and neighborhood change;
- family and community relationships, party ties, and prior commitments;
- direct experience with a policy and trusted sources' accounts of it.

When a person changes their position, the game should be able to say why: e.g., a merchant supports a port repair after repeated delivery delays; a worker opposes a measure after a lost shift; another shopkeeper disagrees because the same repair raises rents or taxes. These are tendencies, not deterministic stereotypes. Let people disagree within the same occupation and change their mind through new experience.

## Social and individual life

Give residents schedules and routines at a human scale: work, commute, meals, worship or other civic observances, errands, family time, rest, and occasional public events. Keep off-screen simulation inexpensive; bring people into the scene when their schedule and location make sense. Preserve individual names, jobs, relationships, current concerns, and relevant memory.

The player should be able to:

- see and approach people in the street and at their workplaces;
- receive a face-to-face prompt tied to the exact nearby person;
- enter a conversation without overriding an owned sitting, meeting, or turn;
- ask what an indirect phrase, rumor, or article reference means;
- meet people again and see the consequences of remembered promises, purchases, votes, and prior conversations;
- attend public gatherings and observe other people speaking and reacting.

Ambient activity should not become noise. Keep a limited set of meaningful, interruptible encounters, with controls to continue walking or decline. Use non-blocking prompts and preserve keyboard, gamepad, mobile, and accessibility paths.

## Streets, signs, buildings, and interiors

### Fixed and navigable town plan

Create a stable capital-district street plan with named streets, intersections, landmarks, and building footprints. Buildings should not drift or regenerate into conflicting locations between visits. Every exterior sign must agree with the directory and the destination behind its door.

Signage should include:

- readable street-name signs at meaningful intersections;
- shop signs with the establishment's name and service;
- civic/church/public-service signs that accurately identify the building;
- optional hours, notices, and current public postings;
- a map/directory accessible in-world, with labels matching the world.

Use visible labels at a distance appropriate to the view, with a readable close-up or interaction on approach. Do not rely solely on floating UI labels; put signs on the buildings and street furniture.

### Enterable places

Make buildings enterable through doors and connected to interiors with clear entry/exit paths. Start with reusable interior kits (shop, café, church, office, meeting room, home, public service), then customize with the correct business/place identity, furniture, stock/notices, and scheduled people. Preserve room geometry, collision, navigation, and current save/continue behavior.

Churches and religious settings must be treated respectfully and follow established world canon. A church should be an actual navigable place with appropriate quiet, layout, service schedule, and optional conversation, not just a generic store or a political prop.

Every interior should answer: who is here, what can the player do, what is open now, and where does the exit lead? Doors must not strand the player or remove needed room contents.

## Emergent story loop

Use a common event record shared by businesses, people, the Ledger, and political state:

**local condition → observed event → human consequence → attributed account → public interpretation → political response → later follow-up**

Example: a delivery delay causes two grocers to run short on flour. One raises prices; another sells out early. A baker reduces hours. Workers and customers discuss the cause, but disagree on whether the port, weather, contract, or policy is responsible. A reporter confirms the delay and attributes the competing explanations. The Ledger explains its “snow on Main Street” phrase as a locally used image for supply trouble only if that phrase actually exists in the story record. A hearing or vote may follow; a later edition reports the result and whether deliveries recovered.

The same event can appear differently in reporting, conversation, business notices, and political debate, but the underlying facts and source record remain consistent. New events should arise only from supported state, and their impacts should be persisted in the career history.

## Implementation sequence

1. **Ledger foundation:** shared event/story records, stable editions, source attribution, corrections, phrase explanations, and non-repeating-but-consistent prose.
2. **Capital map and signs:** fixed street graph, building directory, exterior labels, door links, and a map that uses the same canonical IDs.
3. **Enterable interiors:** reusable interior kits, exits/collision, business identity, and existing offline interactions.
4. **Business simulation:** a small roster of competing stores, stock/cash/price records, schedules, and purchase ledger integration.
5. **Residents and social schedules:** individuals with work/life routines, relationships, local concerns, and face-to-face interactions.
6. **Politics and follow-up:** connect lived experience to views and recorded political consequences; publish related Ledger stories and explain implications.
7. **Visual realism and QA:** lighting/material polish, district screenshots, high/low quality, mobile, offline, gamepad, save/continue, and long-session performance.

Ship each step in small increments. Coordinate with the repository's system/visual/QA ownership notes, do not overwrite existing contracts, and keep the synchronized playable HTML copies byte-consistent where required.

## Acceptance criteria

- A Ledger story can be traced to events, named sources, confirmed facts, claims, uncertainty, and any correction or follow-up.
- Re-opening an edition does not rewrite it. New editions vary wording without changing facts; recent leads and metaphors do not repeat unless intentionally called back.
- Every cryptic or figurative phrase has a discoverable explanation tied to the event/source record, with uncertainty clearly stated.
- Multiple businesses in a market have distinct identities, schedules, stock, prices, relationships, and traceable competition.
- A purchase, wage, supply, or public decision has recorded financial and social effects and can influence later reporting and political views.
- Residents are individuals rather than occupation stereotypes; differing views within a trade and changing views are possible and explainable.
- Street names, shop signs, directory entries, doors, interiors, and exits agree and remain fixed across revisits and Continue.
- The player can enter the supported businesses and civic/religious buildings without collision traps or broken session state.
- Conversation prompts name and interact with the actual nearby actor; active meetings retain ownership and the player's turn never advances while the player is composing.
- The world remains playable offline and retains current saves, performance tiers, controls, and key existing features.
