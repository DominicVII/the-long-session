# Academy papers and organic human conversation: Dominic's master prompt (Nov 24, 2026)

> **About this text.** Dominic sent this in the project room on Nov 24, 2026 at about 3:42 PM ET, in two parts. The Academy
> part comes first and the conversation part right after it, the order he gave. His message was **cut off mid-sentence at
> "A defense minister may respond: We can't"**. The build agent could not open the room transcript from its own session, so
> the text below is a full restatement of every requirement, not his exact wording. Paste his verbatim message
> over each part when you have it. Nothing in the requirements is left out.

---

## Part 1: Expand Academy papers and Engine findings into readable research

Every finding from the Academy, the Research Bureau, the Policy Institute, the Economic Office, the Statistical Service, the
Military Academy, the Scientific Academy, the Intelligence Directorate, the University Consortium, the Engineering Corps,
the Historical Society, or any other state body becomes a full paper of about 2 to 10 pages. Each paper has these sections:

1. **Title**
2. **Institution**
3. **Abstract**: 1 to 3 paragraphs.
4. **Research Question**
5. **Background Literature**: cites earlier in-game findings by day and number.
6. **Methodology**: sample sizes, confidence, and where scholars disagree.
7. **Findings**: the largest section. Every statistic gets an interpretation.
8. **Competing Interpretations**: schools of thought and dissent.
9. **Counterarguments**
10. **Policy Recommendations**: ranked High, Moderate and Experimental, each with its projected impact.
11. **Risk Assessment**
12. **Forecast**: 1, 5 and 10 years ahead, each with optimistic, moderate and pessimistic cases.
13. **Public Response**: newspapers, unions, industrialists, governors, academics and citizens.
14. **Cabinet Relevance**: the decisions the paper opens up.
15. **Historical Significance**

Rules for the Engine:
- Knowledge accumulates. Research persists unless it is disproven.
- There are famous scholars, schools of thought and rivalries.
- Journals cite earlier work.
- Universities compete for prestige.
- Failed theories are archived, not deleted.
- Some discoveries change society.
- Sections can be structured, but the Engine still speaks in its own words inside them.

## Part 2: Organic human conversation system

- Everyone is a persistent person who already holds opinions before the player arrives.
- Speech is natural and imperfect: people interrupt, ramble, misremember, joke and complain.
- Hidden internal traits drive how each person speaks.
- Every citizen has a life story and tells it when asked "tell me about yourself".
- People remember elections, wars, scandals, recessions and promises years later.
- Citizens talk to each other all the time: debates, rumors, taverns, clubs, family disputes. Opinions spread socially.
- Advisors disagree. A cabinet is never unanimous by default. A defense minister may respond: "We can't" *(the message
  ends here)*

---

## How build 20261124b implements it

The code is in `r2js/academy.js` and `r2js/talk.js`, injected by the round-2 patch step.

- **Papers.** `G.academy` keeps only a seed plus each paper's key numbers, citations, school, scholar, standing and day.
  The full text is rebuilt from those every time a paper is opened, so it is identical after a reload, and the paper text
  never enters the save. The API is `window.onumAcademy`. The data shape is in `docs/handoff/20261124.md`.
- **Conversation.**
  - Opinions come from who a person already is, so they exist before the player meets them.
  - Each person has a seeded life story that is the same every time they are asked.
  - Event memory reads the player's own journal, so no new text is stored per person.
  - Gossip between people moves the listener's view slightly toward the speaker's.
  - In a cabinet vote, a lukewarm last seat dissents when the rest of the table would otherwise be unanimous.
  - The talk prompt carries all of the rules above.
