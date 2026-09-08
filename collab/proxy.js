/*!
 * The Long Session — Proxy AI (collab)
 * Learns from a player's recorded actions[] (votes, speeches, party breaks)
 * and decides votes / speech lean when that player is absent.
 * Load before the main game script. Exposes window.ProxyAI.
 */
(function (root) {
  "use strict";

  function abs(n) { return n < 0 ? -n : n; }

  function histVotes(actions) {
    var aye = 0, no = 0, i, a;
    if (!actions || !actions.length) return { aye: 0, no: 0, total: 0 };
    for (i = 0; i < actions.length; i++) {
      a = actions[i];
      if (!a || a.kind !== "vote") continue;
      if (a.vote > 0) aye++;
      else if (a.vote < 0) no++;
    }
    return { aye: aye, no: no, total: aye + no };
  }

  function axisLean(actions, axis) {
    var sum = 0, w = 0, i, a, p, v;
    if (!actions) return 0;
    for (i = 0; i < actions.length; i++) {
      a = actions[i];
      if (!a || a.kind !== "vote" || !a.pos) continue;
      p = a.pos[axis];
      if (typeof p !== "number") continue;
      v = a.vote > 0 ? 1 : -1;
      /* If they voted aye on a bill high on this axis, they lean that way */
      sum += p * v;
      w += abs(p) || 1;
    }
    return w ? sum / w : 0;
  }

  function breakRate(actions) {
    var breaks = 0, votes = 0, i, a;
    if (!actions) return 0;
    for (i = 0; i < actions.length; i++) {
      a = actions[i];
      if (!a || a.kind !== "vote") continue;
      votes++;
      if (a.brokeLine) breaks++;
    }
    return votes ? breaks / votes : 0;
  }

  function speechDir(actions) {
    var aye = 0, no = 0, i, a;
    if (!actions) return 0;
    for (i = 0; i < actions.length; i++) {
      a = actions[i];
      if (!a || a.kind !== "speech") continue;
      if (a.dir > 0) aye++;
      else if (a.dir < 0) no++;
    }
    if (aye + no === 0) return 0;
    return aye >= no ? 1 : -1;
  }

  /**
   * Build / refresh style summary from action log.
   */
  function learnStyle(player) {
    var actions = (player && player.actions) || [];
    var hv = histVotes(actions);
    var style = player.style || {};
    style.econ = axisLean(actions, "econ");
    style.lib = axisLean(actions, "lib");
    style.def = axisLean(actions, "def");
    style.wel = axisLean(actions, "wel");
    style.partyLineBreakRate = breakRate(actions);
    style.voteAyeRate = hv.total ? hv.aye / hv.total : 0.5;
    style.speechLean = speechDir(actions);
    player.style = style;
    return style;
  }

  /**
   * Weighted vote from past actions + bill position.
   * situation: { bill:{pos}, partyLine, member?:{party,traits} }
   * Returns 1 (aye), -1 (no), or null if no signal.
   */
  function decideVote(player, situation) {
    var actions = (player && player.actions) || [];
    var bill = situation && situation.bill;
    var pos = bill && bill.pos;
    var line = situation && situation.partyLine;
    var style = learnStyle(player);
    var score = 0;
    var weight = 0;
    var i, a, sim, j, axes, ax, dp, same;

    /* 1) Nearest historical votes by bill position similarity */
    if (pos && actions.length) {
      axes = ["econ", "lib", "def", "wel"];
      for (i = 0; i < actions.length; i++) {
        a = actions[i];
        if (!a || a.kind !== "vote" || !a.pos || !a.vote) continue;
        sim = 0;
        for (j = 0; j < axes.length; j++) {
          ax = axes[j];
          dp = (a.pos[ax] || 0) - (pos[ax] || 0);
          sim += dp * dp;
        }
        /* closer past bills weigh more */
        same = 1 / (1 + sim / 4000);
        score += (a.vote > 0 ? 1 : -1) * same;
        weight += same;
      }
    }

    /* 2) Style axes vs bill */
    if (pos) {
      score += ((style.econ || 0) * (pos.econ || 0)
             + (style.lib || 0) * (pos.lib || 0)
             + (style.def || 0) * (pos.def || 0)
             + (style.wel || 0) * (pos.wel || 0)) / 120;
      weight += 0.35;
    }

    /* 3) Majority / aye-rate prior when thin history */
    if (weight < 0.2) {
      score += (style.voteAyeRate >= 0.5 ? 1 : -1) * 0.15;
      weight += 0.15;
    }

    /* 4) Occasional party-line break matching their break rate */
    if (line && line !== 0) {
      var br = style.partyLineBreakRate || 0;
      /* soft pull toward line, weaker if they often break */
      score += line * (0.45 * (1 - br));
      weight += 0.25;
    }

    if (weight <= 0) return null;
    return score >= 0 ? 1 : -1;
  }

  /**
   * Speech / floor lean: 1 speak for aye, -1 for no, 0 abstain/skip.
   */
  function decideSpeak(player, situation) {
    var v = decideVote(player, situation);
    var style = learnStyle(player);
    if (v === null) return style.speechLean || 0;
    /* Prefer speaking when history shows they spoke in similar direction */
    if (style.speechLean && style.speechLean === v) return v;
    return v;
  }

  /**
   * Public entry: decide({ vote|speak }, …)
   */
  function decide(player, situation) {
    var kind = (situation && situation.kind) || "vote";
    if (kind === "speak" || kind === "speech") return decideSpeak(player, situation);
    return decideVote(player, situation);
  }

  root.ProxyAI = {
    learnStyle: learnStyle,
    decide: decide,
    decideVote: decideVote,
    decideSpeak: decideSpeak,
    histVotes: histVotes
  };
})(typeof window !== "undefined" ? window : this);
