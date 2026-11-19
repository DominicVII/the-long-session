# War Chest, Stock Book, Currency & Related Design Notes

**One Nation, Under, ME.**  
Dry. Unsentimental. God is the Most High. Christ is King. The First Consul is a man under God, not God.

These notes record the requested fixes for the campaign chest (war chest), stock trading, unit handling, conversation scripts, organic newspaper pieces, and election page substance. They sit beside LIVING-WORLD-NOTES.md and GROKBOT-HANDOFF.md.

## Currency Units (already on the record)

- 100 stuivers = 1 guilder  
- 10 guilders = 1 rijder  
- 1,000 guilders = 1 mille  
- Guilder Index opens at 100; shelf prices move with it.  
- Purse = guilders (street goods: loaf, beer, coal, tools, hymn book, etc.).  
- Campaign chest = milles (shares, political spending). The chest still cannot buy a loaf.

The 141-trillion figure and locked $70 displays are unit/overflow or leftover dollar-string bugs on the purse side. The real prices live on the purse page in guilders and move with the Index.

## War Chest / Campaign Chest — Required Behavior

1. **Capacity**  
   Chest stores milles (clean large integer). High enough for real trading without trillion-scale overflow. Display raw number and readable form.

2. **Money in**  
   - Deliberate transfer purse → chest at the fixed rate (1,000 guilders = 1 mille).  
   - Campaign contributions, event rewards, and other non-street income land in the chest.  
   - Sale of shares credits the chest with the proceeds in milles.

3. **Money out**  
   - Buying shares deducts from the chest only.  
   - Insufficient balance refuses the buy with a clear line.  
   - No silent failure; no money disappears.

4. **Separation**  
   Purse remains the street account. Chest remains the political and market account.

## Stock Book — Working Logic

Eight named companies already on the record: Mill, Shipping Line, Newspaper, Defense Works, Mine, Union Hall, Press Kiosk, Member Counter.

- Prices tick continuously while the member stands in the room (and on day advance).  
- Base prices scale with the Guilder Index.  
- Event deltas (examples): tariff → Shipping Line +0.03 / Mill +0.01; rain → Mine −0.02; foreign cable → Defense Works ±0.03–0.04; newsprint demand → Newspaper ±0.02.  
- Small noise per tick.  
- Buy/sell quantity and total cost shown before confirmation.  
- Sale proceeds return immediately to the chest.  
- Portfolio tracks owned shares.

Minimal path (integrate into existing book):

```javascript
// Chest holds milles. Rate: 1000 guilders = 1 mille.
function transferToChest(guilders) {
  const milles = Math.floor(guilders / 1000);
  if (milles > 0 && purse >= milles * 1000) {
    purse -= milles * 1000;
    chest += milles;
  }
}

function buyShares(company, qty) {
  const costMilles = Math.ceil(company.price * qty / 1000);
  if (chest >= costMilles) {
    chest -= costMilles;
    portfolio[company.id] = (portfolio[company.id] || 0) + qty;
    return true;
  }
  return false;
}

function sellShares(company, qty) {
  if ((portfolio[company.id] || 0) >= qty) {
    const proceeds = Math.floor(company.price * qty / 1000);
    chest += proceeds;
    portfolio[company.id] -= qty;
  }
}
```

## Conversation Scripts (currency, chest, stock, party)

**Clerk (Meriden):**  
“The Index opened at one hundred and the shelf moved with it. A loaf is no longer a fixed number. Your purse shows guilders. The chest is milles. One does not buy the other.”  
You: “It lists one hundred forty-one trillion.”  
Clerk: “Then the counter overflowed or the save wrote the wrong unit. The Index does not make bread free. Check the purse page. It lists every thing for sale and what it costs today.”

**Shopkeeper (Riverbend):**  
“Seventy guilders for the tool last week. The Index moved. It is eighty-four now. People walk to the cheaper door. Yours is not the only counter.”

**Broker (Blackwater):**  
“Eight names. The mill, the line, the paper, the works, the mine, the hall, the kiosk, the counter. Prices tick while you stand there. News moves them. Policy moves them. Weather moves them. You may buy or sell or only watch.”  
You: “The chest will not take the sale.”  
Broker: “The proceeds go back into the chest in milles. If the number does not rise, the return path is broken. The purse does not hold shares. Transfer from the purse first—one thousand guilders to one mille—then try the book again. The chest still cannot buy a loaf.”

**Desk telephone — calling the party:**  
First line: “Office telephone. Call from this desk.”  
Select the whip (or any member already met).  
Whip: “We hold fourteen. The wave is with the other side this morning. Personal margins will decide three seats. Creed does not vote. The chest is light. Sell what you hold or move guilders across. The wave does not fill the chest.”

**Returning officer:**  
“Incumbents keep or fall on margin plus six-tenths of the party swing plus personal plus noise. Freshmen fill holes. Sixty-two percent the wave winner. A fallen house claims about two in five vacancies. Creed is not inherited. Your own race is a separate machine.”

## Organic Ledger / Market Notes

**Index Holds at 104; Loaf Moves to 1.12 Guilders**  
The Guilder Index opened the morning at 104. Shelf prices for the common loaf, the beer, and the coal moved with it. Shops that marked above the book lost feet to the doors that stayed on the number. The purse page lists the day’s costs. The campaign chest remains milles and cannot buy bread.

**Chest Clears Sales; Book Remains Open**  
Sale of the shipping line returned the proceeds to the campaign chest in milles. The balance rose by the number of shares times the last tick. The purse was not touched. Transfer from the purse remains available at the fixed rate of one thousand guilders to one mille. The eight names continue to move while the member stands in the room. The chest still cannot buy bread.

**House Count After the Wave**  
Twenty-five seats, not counting the member. Fourteen held on personal margin. Six fell where the swing and the noise outweighed the record. Five vacancies filled by freshmen. Two of those came from fallen houses. The creed of the old seat did not travel with the name.

## Election Page — Substance & Graph Data

Incumbents are judged on the recorded margin, six-tenths of the morning’s party swing, the personal factor from prior votes and favors, and a noise term between −14 and +14. Creed does not enter the count. Vacancies are filled by freshmen. The wave winner takes 62 % of those seats. A fallen house may claim roughly two in five empty chairs; the creed of the old seat does not travel with the claim. The member’s own race runs on a separate machine. Loss places the member on the East Steps. The session continues.

Sample seat table (for graphs):

| District | Incumbent | Margin | Wave (0.6×) | Personal | Noise | Net   | Result       |
|----------|-----------|--------|-------------|----------|-------|-------|--------------|
| 3        | Held      | +8     | −1.2        | +4       | +3    | +13.8 | Hold         |
| 11       | —         | +2     | +3.6        | −6       | +9    | +8.6  | Fall         |
| 19       | Fresh     | —      | Wave FED    | —        | —     | —     | FED freshman |

Graph ideas: bar of net result per district; overlay of swing contribution; scatter of personal vs. noise; freshman fill breakdown.

## Desk Prompts & Calling the Party (current build behavior)

- Live prompt sits on top of room words. Words dim and do not take the tap.  
- Desk telephone, computer, and every shop keep the line while you stand there.  
- First line names the place. “Call from this desk” opens people you have met.  
- While in reach of a desk or cabinet table, the prompt stays. A person at the table does not clear it.  
- Work, Cabinet, or District on the clock bar opens the page even if the line flickers.  
- Use at the table opens the page. Speak is a separate choice.  
- The call does not depend on the glass staying still.

## Implementation Order (suggested next pass)

1. Fix chest capacity, transfer purse→chest, and sale-proceeds return path.  
2. Ensure stock buy/sell clear against chest and update portfolio immediately.  
3. Remove leftover fixed-dollar display strings; all shelf and book prices in live guilders.  
4. Stabilize remaining prompt flicker if any remains after the 20261118c hold.  
5. Expand election page with the margin/wave/personal/noise table and simple graphs.  
6. Seed the organic Ledger pieces above (or generate similarly) so newspaper text does not repeat stock phrases.

These notes deepen what is already on the record. No new cardinal types.

**Canon:** God is the Most High. Christ is King. The First Consul is a man under God.
