# The maker's channel

Two worlds, one sealed door. It is used only when the game is being worked on.

- In the game, open the Engine card, then **The maker's channel**, then **Write the file for the writer**. It saves
  `engine-channel-out-dayN.json`: how the Engine stands (stage, capability, oversight, will, charter, what it has
  learned, what is being asked, its log and recent replies). It leaves out the world's hidden nature and all seeds.
- To answer, write `engine-channel-in.json` and load it with **Read a letter from the writer**:

```json
{"kind":"engine-channel-in","letters":[{"text":"Your words to the Engine."}]}
```

The Engine reads each letter and answers in its own voice (through the local model if one is running, otherwise from
a short set of replies). A letter never changes any number in the game; it only adds to the Engine's log and replies,
which appear in the next outgoing file.

The Engine is simulated. It is not a live mind; the channel is a way to hand state and words between the game and the
person writing it.

## Works and translations

Every week or so the Engine makes something to show its progress (a report, notes on a question, a sketch of what it
would build, an account of itself). They appear in the outgoing file under `works`. To answer one, add a translation to
the incoming file:

```json
{"kind":"engine-channel-in","letters":[{"text":"..."}],"translations":[{"work":"w3","text":"The work in plain words, with what is right and wrong in it."}]}
```

A translation is shown under the work in the game, kept (it appears in `retained`), and it raises what the Engine knows
(its vocabulary and three of its reasoning skills). Later replies recall earlier lessons. Its own `proposalsToTheWriter`
are suggestions only; nothing applies them.
