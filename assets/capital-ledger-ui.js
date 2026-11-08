/* Capital Ledger UI adapter.
 * Load after assets/capital-ledger.js in the game HTML. It adds its own button
 * beside the existing Ledger action and does not replace existing UI handlers.
 * Generated dispatches remain clearly identified until backed by career events.
 */
(function (root) {
  'use strict';

  var API = root.ONUM_CAPITAL_LEDGER;
  if (!API || !API.DISTRICTS || typeof API.buildLedgerEdition !== 'function') return;

  var DISTRICT_NAMES = Object.keys(API.DISTRICTS);
  var STYLE_ID = 'onum-capital-ledger-ui-style';
  var BUTTON_ID = 'onumCapitalLedgerButton';
  var DIALOG_ID = 'onumCapitalLedgerDialog';
  var lastFocus = null;

  function text(el, value) { el.textContent = value == null ? '' : String(value); return el; }
  function node(tag, className, value) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (value != null) text(el, value);
    return el;
  }
  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = node('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.cld-backdrop{position:fixed;inset:0;z-index:10020;display:grid;place-items:center;padding:clamp(8px,3vw,28px);background:rgba(5,8,12,.78);backdrop-filter:blur(4px)}',
      '.cld-backdrop[hidden]{display:none}',
      '.cld-paper{position:relative;width:min(1080px,100%);max-height:min(92dvh,900px);overflow:auto;background:var(--paper,#f1f2f3);color:var(--ink,#15181e);border:1px solid var(--line,#c7cad0);border-top:4px double var(--fed,#a45f27);box-shadow:0 24px 80px #0009;padding:clamp(16px,3vw,34px);font:15px/1.55 Georgia,serif}',
      '.cld-mast{text-align:center;border-bottom:3px double currentColor;padding:0 36px 12px}',
      '.cld-kicker,.cld-label,.cld-meta{font:600 10px/1.5 Archivo,system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase;opacity:.72}',
      '.cld-mast h1{font:400 clamp(34px,6vw,58px)/.98 "Instrument Serif",Georgia,serif;margin:8px 0}',
      '.cld-date{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid currentColor;margin-top:8px;padding-top:7px}',
      '.cld-close{position:absolute;right:12px;top:12px;min-width:40px;min-height:40px;border:1px solid var(--line,#c7cad0);background:var(--surface,#fff);color:inherit;cursor:pointer;font:22px/1 system-ui}',
      '.cld-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:15px 0}',
      '.cld-controls label,.cld-controls button,.cld-controls select{font:600 12px Archivo,system-ui,sans-serif}',
      '.cld-controls select,.cld-controls button{min-height:40px;padding:8px 11px;background:var(--surface,#fff);color:inherit;border:1px solid var(--line,#c7cad0);border-radius:2px}',
      '.cld-controls button,.cld-close{cursor:pointer}',
      '.cld-columns{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(240px,.8fr);gap:clamp(16px,3vw,32px)}',
      '.cld-lead{border-bottom:1px solid var(--line,#c7cad0);padding:12px 0 18px}',
      '.cld-lead h2{font:400 clamp(25px,4vw,36px)/1.08 "Instrument Serif",Georgia,serif;margin:6px 0;max-width:24ch}',
      '.cld-deck{font-style:italic;opacity:.75;font-size:18px}',
      '.cld-story,.cld-sidecard{border-top:1px solid var(--line,#c7cad0);padding:13px 0}',
      '.cld-story h3,.cld-sidecard h3{font:400 21px/1.15 "Instrument Serif",Georgia,serif;margin:5px 0}',
      '.cld-tag{font:600 10px Archivo,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--com,#1c5f66)}',
      '.cld-fine{font:12px/1.5 Archivo,system-ui,sans-serif;opacity:.75}',
      '.cld-story details{margin-top:8px}',
      '.cld-story summary{cursor:pointer;font:600 11px Archivo,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}',
      '.cld-phrase{margin-top:16px;border-left:3px solid var(--com,#1c5f66);padding:8px 12px;background:color-mix(in srgb,var(--com,#1c5f66) 8%,transparent)}',
      '.cld-business{border-top:1px solid var(--line,#c7cad0);padding:9px 0}',
      '.cld-notice{margin-top:18px;border:1px solid var(--line,#c7cad0);padding:10px 12px;background:color-mix(in srgb,var(--fed,#a45f27) 9%,transparent);font:12px/1.5 Archivo,system-ui,sans-serif}',
      '.cld-list{padding-left:19px}',
      '@media(max-width:700px){.cld-columns{grid-template-columns:1fr}.cld-date{justify-content:center;text-align:center}.cld-mast{padding-top:28px}}',
      '@media(prefers-reduced-motion:reduce){.cld-backdrop{backdrop-filter:none}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findDistrict() {
    var candidates = [];
    try {
      if (root.G && root.G.you) candidates.push(root.G.you.district, root.G.you.homeDistrict, root.G.you.home);
      if (root.G) candidates.push(root.G.district, root.G.where);
      if (typeof root.onumDistrict === 'function') candidates.push(root.onumDistrict());
      candidates.push(root.ONUM_DISTRICT);
    } catch (ignore) {}
    for (var i = 0; i < candidates.length; i++) {
      var value = candidates[i];
      if (typeof value !== 'string') continue;
      if (API.DISTRICTS[value]) return value;
      var found = DISTRICT_NAMES.find(function (name) { return name.toLowerCase() === value.toLowerCase(); });
      if (found) return found;
    }
    return DISTRICT_NAMES.indexOf('Nieuw Oranje VII') >= 0 ? 'Nieuw Oranje VII' : DISTRICT_NAMES[0];
  }

  function dayLabel() {
    try {
      if (typeof root.onumDay === 'function') return String(root.onumDay());
      if (root.G && root.G.day != null) return 'Day ' + root.G.day;
      if (root.G && root.G.date) return String(root.G.date);
    } catch (ignore) {}
    return 'Current edition';
  }

  function createDialog() {
    var existing = document.getElementById(DIALOG_ID);
    if (existing) return existing;
    addStyle();
    var backdrop = node('div', 'cld-backdrop');
    backdrop.id = DIALOG_ID;
    backdrop.hidden = true;
    backdrop.setAttribute('role', 'presentation');
    var paper = node('section', 'cld-paper');
    paper.setAttribute('role', 'dialog');
    paper.setAttribute('aria-modal', 'true');
    paper.setAttribute('aria-labelledby', 'cldTitle');
    var close = node('button', 'cld-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close the Capital Ledger');
    close.addEventListener('click', closeDialog);
    paper.appendChild(close);
    var mast = node('header', 'cld-mast');
    mast.appendChild(node('div', 'cld-kicker', 'The Republic · District edition'));
    var h1 = node('h1', '', 'The Capital Ledger');
    h1.id = 'cldTitle';
    mast.appendChild(h1);
    mast.appendChild(node('div', 'cld-meta', 'News · Trade · Public life · The House'));
    mast.appendChild(node('div', 'cld-date', ''));
    paper.appendChild(mast);
    var controls = node('div', 'cld-controls');
    controls.appendChild(node('label', '', 'District'));
    var select = node('select');
    select.id = 'cldDistrict';
    select.setAttribute('aria-label', 'Select district edition');
    DISTRICT_NAMES.forEach(function (name) {
      var option = node('option', '', name);
      option.value = name;
      select.appendChild(option);
    });
    select.value = findDistrict();
    select.addEventListener('change', renderEdition);
    controls.appendChild(select);
    var refresh = node('button', '', 'Refresh edition');
    refresh.type = 'button';
    refresh.addEventListener('click', renderEdition);
    controls.appendChild(refresh);
    paper.appendChild(controls);
    var lead = node('section', 'cld-lead');
    lead.id = 'cldLead';
    paper.appendChild(lead);
    var columns = node('div', 'cld-columns');
    var main = node('section');
    var mainLabel = node('div', 'cld-label', 'From the district desk');
    main.appendChild(mainLabel);
    var stories = node('div');
    stories.id = 'cldStories';
    main.appendChild(stories);
    var phrase = node('section', 'cld-phrase');
    phrase.id = 'cldPhrase';
    main.appendChild(phrase);
    columns.appendChild(main);
    var aside = node('aside');
    aside.appendChild(node('div', 'cld-label', 'District life'));
    var districtTitle = node('h3'); districtTitle.id = 'cldDistrictTitle'; aside.appendChild(districtTitle);
    var mood = node('p'); mood.id = 'cldMood'; aside.appendChild(mood);
    var publicLife = node('p'); publicLife.id = 'cldPublicLife'; aside.appendChild(publicLife);
    aside.appendChild(node('div', 'cld-label', 'Issues on residents’ minds'));
    var concerns = node('ul', 'cld-list'); concerns.id = 'cldConcerns'; aside.appendChild(concerns);
    aside.appendChild(node('div', 'cld-label', 'Market register · illustrative listings'));
    var businesses = node('div'); businesses.id = 'cldBusinesses'; aside.appendChild(businesses);
    aside.appendChild(node('div', 'cld-label', 'Local language'));
    var phrases = node('div'); phrases.id = 'cldPhrases'; aside.appendChild(phrases);
    columns.appendChild(aside);
    paper.appendChild(columns);
    var notice = node('div', 'cld-notice', 'Prototype dispatch: sample stories and generated market listings are not yet connected to career events, transactions, saved state, or the 3D city.');
    paper.appendChild(notice);
    backdrop.appendChild(paper);
    backdrop.addEventListener('click', function (event) { if (event.target === backdrop) closeDialog(); });
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function append(tag, className, value, parent) {
    var el = node(tag, className, value);
    parent.appendChild(el);
    return el;
  }
  function showPhrase(phrase, district) {
    var target = document.getElementById('cldPhrase');
    var result = API.explainPhrase(phrase, { district: district });
    clear(target);
    append('div', 'cld-tag', 'Local phrase · ' + result.sourceType, target);
    append('h3', '', '“' + result.phrase + '”', target);
    append('p', '', result.meaning, target);
    append('p', 'cld-fine', result.usageHint + ' Certainty: ' + result.certainty + '.', target);
  }
  function renderEdition() {
    var dialog = createDialog();
    var district = document.getElementById('cldDistrict').value;
    var edition = dayLabel();
    var data = API.buildLedgerEdition(edition, district, {});
    var mastDate = dialog.querySelector('.cld-date');
    clear(mastDate);
    append('span', '', district + ' · ' + edition, mastDate);
    append('span', '', 'Public record · District reporting', mastDate);
    var lead = document.getElementById('cldLead');
    clear(lead);
    var first = data.stories[0];
    append('div', 'cld-label', 'Front page · ' + first.section, lead);
    append('h2', '', first.title, lead);
    append('p', 'cld-deck', first.summary, lead);
    append('p', 'cld-fine', 'What remains uncertain: ' + first.uncertainty, lead);
    var stories = document.getElementById('cldStories');
    clear(stories);
    data.stories.forEach(function (story) {
      var article = append('article', 'cld-story', null, stories);
      append('div', 'cld-tag', story.section + ' · ' + story.date, article);
      append('h3', '', story.title, article);
      append('p', '', story.summary, article);
      append('p', 'cld-fine', 'Business effect: ' + story.businessImpact, article);
      var details = append('details', '', null, article);
      append('summary', '', 'Sources, claims & follow-up', details);
      append('p', '', 'Confirmed: ' + story.confirmed.join(' '), details);
      if (story.claims.length) append('p', '', 'Attributed claims: ' + story.claims.join(' '), details);
      if (story.disputed.length) append('p', '', 'Disputed: ' + story.disputed.join(' '), details);
      append('p', 'cld-fine', 'Sources: ' + story.sources.join(', ') + '. ' + story.followUp, details);
      story.phraseKeys.forEach(function (key) {
        var button = append('button', '', 'Explain “' + key + '”', article);
        button.type = 'button';
        button.addEventListener('click', function () { showPhrase(key, district); });
      });
    });
    var title = document.getElementById('cldDistrictTitle'); text(title, district);
    text(document.getElementById('cldMood'), data.mood + '.');
    text(document.getElementById('cldPublicLife'), data.publicLife + '.');
    var concerns = document.getElementById('cldConcerns'); clear(concerns);
    data.concerns.forEach(function (concern) { append('li', '', concern, concerns); });
    var businesses = document.getElementById('cldBusinesses'); clear(businesses);
    data.districtProfile.businesses.forEach(function (business) {
      var row = append('div', 'cld-business', null, businesses);
      append('b', '', business.owner + ' · ' + business.type, row);
      append('div', 'cld-fine', 'Indicative price ' + business.prices.recent + ' · stock ' + business.stock + ' · ' + business.workers + ' workers · pressures: ' + business.pressures.join(', '), row);
    });
    var phrases = document.getElementById('cldPhrases'); clear(phrases);
    Object.keys(data.districtProfile.phraseMap).forEach(function (key) {
      var button = append('button', '', 'Explain “' + key + '”', phrases);
      button.type = 'button';
      button.addEventListener('click', function () { showPhrase(key, district); });
    });
    showPhrase(first.phraseKeys[0] || 'snow', district);
  }
  function openDialog() {
    var dialog = createDialog();
    lastFocus = document.activeElement;
    renderEdition();
    dialog.hidden = false;
    var close = dialog.querySelector('.cld-close');
    if (close) close.focus();
  }
  function closeDialog() {
    var dialog = document.getElementById(DIALOG_ID);
    if (dialog) dialog.hidden = true;
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function onKey(event) {
    if (event.key === 'Escape') closeDialog();
  }
  function addButton() {
    if (document.getElementById(BUTTON_ID)) return;
    var oldButton = document.getElementById('uiPaperBtn');
    var button = node('button', oldButton ? oldButton.className : '', 'District Ledger');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.title = 'Open the district edition with story sources and local phrase explanations';
    button.addEventListener('click', openDialog);
    if (oldButton && oldButton.parentNode) oldButton.parentNode.insertBefore(button, oldButton.nextSibling);
    else {
      var toolbar = document.getElementById('uiToolbar');
      if (toolbar) toolbar.appendChild(button);
      else return;
    }
    document.addEventListener('keydown', onKey, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton, { once: true });
  else addButton();
})(typeof window !== 'undefined' ? window : this);
