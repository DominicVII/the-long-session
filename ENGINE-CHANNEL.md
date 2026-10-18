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
