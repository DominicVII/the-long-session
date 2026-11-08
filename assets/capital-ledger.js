(function(){
  'use strict';

  var DISTRICTS = {
    'Nieuw Oranje VII': {
      name: 'Nieuw Oranje VII',
      region: 'capital',
      mood: 'formal, watchful, market-heavy',
      businesses: ['printing house', 'law chamber', 'café', 'grocer', 'bookshop', 'wine merchant'],
      concerns: ['rent pressure', 'delivery delay', 'public trust', 'paper cost', 'church attendance'],
      publicLife: 'government, ceremony, commerce, petitions, gossip, civic ritual',
      phraseMap: {
        snow: 'used for supply, scarcity, or social anxiety when a disruption is broad and hard to name',
        'Main Street': 'the central route where business, rumor, and public notice overlap',
        'cold ledger': 'the paper record used to prove who owes what and who is being held to account'
      }
    },
    Meriden: {
      name: 'Meriden',
      region: 'east',
      mood: 'industrial, practical, sharply opinionated',
      businesses: ['forge', 'mills', 'coal depots', 'rail supplier', 'workers hall', 'market stalls'],
      concerns: ['wages', 'hours', 'laid-off hands', 'rail congestion', 'labor solidarity'],
      publicLife: 'union halls, streetside bargaining, lunch-hour politics, factory gossip',
      phraseMap: {
        snow: 'a working-class warning of stoppage, scarcity, or a bad week in the mills',
        'iron morning': 'a bad day in the trades, often tied to factory stoppage or debt pressure',
        'the line': 'the labor line, queue, or public claim on wages and jobs'
      }
    },
    Calder: {
      name: 'Calder',
      region: 'north',
      mood: 'rural, patient, tied to weather and harvest',
      businesses: ['granary', 'seed shop', 'farm cooperatives', 'mill', 'feed store', 'tavern'],
      concerns: ['rainfall', 'grain price', 'toll roads', 'land tax', 'tenant pressure'],
      publicLife: 'church market days, harvest talk, road watch, weather warnings',
      phraseMap: {
        snow: 'often refers to a late season, a bad field, or a month of hardship',
        'thin harvest': 'a poor year or weak crop with political and market consequences',
        'road-fall': 'a disruption in delivery, transport, or trade route access'
      }
    },
    Riverbend: {
      name: 'Riverbend',
      region: 'west',
      mood: 'merchant, opportunistic, fast-moving',
      businesses: ['dockside warehouses', 'shipping firm', 'auction hall', 'port café', 'cloth market', 'bank'],
      concerns: ['shipping rates', 'tariffs', 'credit', 'dock labor', 'inventory loss'],
      publicLife: 'port gossip, auctions, merchant clubs, riverfront risks',
      phraseMap: {
        snow: 'may mean a cold market, slow delivery, or hard currency troubles',
        'waterfall': 'a sudden signal that prices or business conditions are swinging hard',
        'the quay': 'the port-lane where trust and speed matter above all else'
      }
    },
    Fallowfield: {
      name: 'Fallowfield',
      region: 'south',
      mood: 'traditional, formal, defensive',
      businesses: ['estate office', 'wine cellar', 'grist mill', 'gentry club', 'forge works', 'stables'],
      concerns: ['estate debt', 'land rights', 'inheritance', 'social rank', 'rural law'],
      publicLife: 'land dinners, household politics, county bargains, formal calls',
      phraseMap: {
        snow: 'often a coded way to signal social or household instability in a family-led district',
        'leaf-fall': 'a sign that patronage or prestige is under strain',
        'the old names': 'the inherited families whose status is political capital in itself'
      }
    },
    Blackwater: {
      name: 'Blackwater',
      region: 'coast',
      mood: 'defensive, orderly, security-minded',
      businesses: ['arsenal supply', 'mariner stores', 'barracks canteen', 'coast insurance', 'dry goods', 'seamarket'],
      concerns: ['security orders', 'military spending', 'port defense', 'trade risk', 'harbor wages'],
      publicLife: 'officer clubs, drill-ground talk, harbor watch, security committees',
      phraseMap: {
        snow: 'often used to mean watchfulness, disruption, or a threat that is not yet named plainly',
        'watch chain': 'a security network that can become political pressure when it tightens',
        'the tide line': 'the near-future threat boundary where trade and defense meet'
      }
    },
    Kestrel: {
      name: 'Kestrel',
      region: 'mountain',
      mood: 'independent, distrustful, self-sufficient',
      businesses: ['mountain store', 'ore exchange', 'forge', 'cabin market', 'way station', 'timber yard'],
      concerns: ['road closure', 'tax burden', 'isolated supply', 'mountain risk', 'local autonomy'],
      publicLife: 'valley meetings, market crossroads, weather warnings, local vows',
      phraseMap: {
        snow: 'usually means hard travel, shortage, or a mountain problem that has gone beyond ordinary weather',
        'the high pass': 'the narrow route by which the district can be reached or cut off',
        'closed road': 'a political and practical warning that someone is choosing isolation'
      }
    }
  };

  var BUSINESS_TYPES = [
    'grocer', 'bakery', 'café', 'bookshop', 'barber', 'law chamber',
    'forge', 'warehouse', 'printer', 'dockside store', 'wine merchant',
    'clothier', 'seed shop', 'tavern', 'market stalls'
  ];

  var PHRASE_LIBRARY = {
    snow: {
      type: 'metaphor',
      explanation: 'A local shorthand for disruption, scarcity, public anxiety, or a situation that has become hard to name directly.',
      usageHint: 'Ask who is using it and what went wrong before deciding whether it means weather, shortage, or political harm.',
      confidence: 'uncertain unless tied to a clear event record'
    },
    'Main Street': {
      type: 'place-reference',
      explanation: 'The busy corridor where commerce, rumor, and civic life overlap; a phrase can describe where a problem became visible to the public.',
      usageHint: 'Often used to mean a public crisis that is visible to the city rather than confined to a private room.',
      confidence: 'medium'
    },
    'cold ledger': {
      type: 'financial-metaphor',
      explanation: 'A record of who owes what, how accounts stand, and what can be proven in public. It is not just numbers—it is a political statement about responsibility.',
      usageHint: 'Used when a matter is being reduced to account, debt, or obligation.',
      confidence: 'high'
    },
    'iron morning': {
      type: 'labor-metaphor',
      explanation: 'A phrase for a day of hard labor, low wages, or a factory disruption that can affect a whole neighborhood.',
      usageHint: 'Usually tied to working conditions or a stoppage, not a weather event.',
      confidence: 'high'
    },
    'thin harvest': {
      type: 'agricultural-metaphor',
      explanation: 'A poor yield or weak harvest that carries both economic and political weight.',
      usageHint: 'Can signal a district complaint about taxes, trade, or policy as well as weather.',
      confidence: 'high'
    },
    'the high pass': {
      type: 'geographic-metaphor',
      explanation: 'A narrow corridor or route whose closure means isolation, danger, or strategic leverage.',
      usageHint: 'Often used when both geography and political bargaining are at issue.',
      confidence: 'high'
    }
  };

  function clamp(v, min, max){
    return Math.min(max, Math.max(min, v));
  }

  function makeBusinessEntry(id, district, type, owner, x, y){
    return {
      id: id,
      district: district,
      type: type,
      owner: owner,
      location: { x: x, y: y },
      hours: 'open during normal market hours',
      reputation: clamp((Math.random() * 0.6 + 0.4), 0, 1),
      stock: Math.round(30 + Math.random() * 80),
      prices: {
        base: 10 + Math.round(Math.random() * 30),
        recent: 10 + Math.round(Math.random() * 35)
      },
      workers: Math.round(2 + Math.random() * 9),
      pressures: ['competition', 'supply', 'rent'],
      vibe: 'busy, cautious, or sharp depending on district mood'
    };
  }

  function makeDistrictProfile(label, seed){
    var profile = DISTRICTS[label] || DISTRICTS['Nieuw Oranje VII'];
    var baseBusinesses = [];
    var names = [
      'Bell', 'Crown', 'North', 'Stone', 'Harbor', 'Oak', 'Leaden', 'Market', 'Pine', 'Rowan', 'Guild', 'Morrow'
    ];

    for (var i = 0; i < 5; i++) {
      baseBusinesses.push(makeBusinessEntry(
        (label + '-' + i).replace(/\s+/g, '-').toLowerCase(),
        label,
        BUSINESS_TYPES[(seed + i) % BUSINESS_TYPES.length],
        names[(seed + i) % names.length] + ' & Co.',
        (i * 11 + seed) % 100,
        (i * 17 + seed * 3) % 100
      ));
    }

    return {
      district: label,
      region: profile.region,
      mood: profile.mood,
      concerns: profile.concerns,
      publicLife: profile.publicLife,
      phraseMap: profile.phraseMap,
      businesses: baseBusinesses,
      pulse: {
        crowding: clamp((seed % 10) / 10 + 0.4, 0, 1),
        trade: clamp(0.35 + (seed % 7) / 10, 0, 1),
        tension: clamp(0.2 + ((seed + 3) % 8) / 12, 0, 1),
        publicTrust: clamp(0.5 + ((seed + 1) % 5) / 12, 0, 1)
      }
    };
  }

  function createStoryRecord(options){
    options = options || {};
    return {
      id: options.id || ('story-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)),
      title: options.title || 'Local notice',
      section: options.section || 'district',
      district: options.district || 'Nieuw Oranje VII',
      date: options.date || 'The current day',
      summary: options.summary || 'A public event with consequences for business and politics.',
      confirmed: Array.isArray(options.confirmed) ? options.confirmed : [options.summary || 'The event itself is recorded'],
      claims: Array.isArray(options.claims) ? options.claims : [],
      disputed: Array.isArray(options.disputed) ? options.disputed : [],
      uncertainty: options.uncertainty || 'Uncertainty remains around motive and full consequence.',
      sources: Array.isArray(options.sources) ? options.sources : ['local witness'],
      followUp: options.followUp || 'A follow-up is expected as the facts settle.',
      politicalWeight: options.politicalWeight || 'local',
      businessImpact: options.businessImpact || 'materials, wages, and commerce are likely to shift',
      phraseKeys: Array.isArray(options.phraseKeys) ? options.phraseKeys : []
    };
  }

  function explainPhrase(phraseKey, context){
    var key = String(phraseKey || '').trim().toLowerCase();
    var lookup = PHRASE_LIBRARY[key];
    if (!lookup) {
      var mapKey = Object.keys(PHRASE_LIBRARY).find(function(candidate){
        return String(candidate).toLowerCase() === key;
      });
      lookup = mapKey ? PHRASE_LIBRARY[mapKey] : null;
    }

    var district = context && context.district ? context.district : 'Nieuw Oranje VII';
    var districtInfo = DISTRICTS[district] || DISTRICTS['Nieuw Oranje VII'];
    var localMeaning = districtInfo && districtInfo.phraseMap && districtInfo.phraseMap[key];

    return {
      phrase: phraseKey || 'unknown phrase',
      district: district,
      meaning: localMeaning || (lookup && lookup.explanation) || 'The phrase is not yet tied to a clear public record.',
      usageHint: (lookup && lookup.usageHint) || 'Ask a witness or consult the source trail before pinning it to a political meaning.',
      certainty: (lookup && lookup.confidence) || 'uncertain',
      sourceType: (lookup && lookup.type) || 'unclassified'
    };
  }

  function buildLedgerEdition(dayLabel, districtName, state){
    var district = districtName || 'Nieuw Oranje VII';
    var districtInfo = DISTRICTS[district] || DISTRICTS['Nieuw Oranje VII'];
    var profile = makeDistrictProfile(district, (dayLabel || '').length + (district.length * 3));
    var localState = state || {};

    var leads = [
      createStoryRecord({
        title: 'Market shifts and the city pulse',
        section: 'district',
        district: district,
        date: dayLabel,
        summary: 'A local change in supply, wages, or public attention is visible in the streets and in the accounts.',
        confirmed: [
          'Businesses report a change in prices or customer flow.',
          'Neighbors describe the affected route or district as unusually lively or tense.'
        ],
        claims: [
          'Some residents say the disruption is temporary.',
          'Others say policy or a hidden contract is doing the work.'
        ],
        uncertainty: 'The public explanation is still contested, but the sensory and economic effects are real.',
        sources: ['market witness', 'shopkeeper', 'street observer'],
        followUp: 'A later edition is likely to report whether the disruption is temporary or structural.',
        phraseKeys: ['snow'],
        politicalWeight: 'district',
        businessImpact: 'stock, rates, and foot traffic are the measurable result.'
      }),
      createStoryRecord({
        title: 'Public service and the daily routine',
        section: 'public life',
        district: district,
        date: dayLabel,
        summary: 'Residents discuss queues, service delays, and whether the city is keeping its promises.',
        confirmed: ['Public services are visible to the district and are being discussed in the open.'],
        claims: ['Some allege that a policy is to blame, others say it is a temporary failure.'],
        disputed: ['Whether the matter is political or administrative remains contested.'],
        uncertainty: 'The issue is still being argued in public, but the disruption is not imagined.',
        sources: ['civic office', 'resident witness', 'street clerk'],
        followUp: 'The next edition may show whether the service was restored or reformed.',
        phraseKeys: ['Main Street'],
        politicalWeight: 'local',
        businessImpact: 'customer flow and trust will shift if the issue remains unresolved.'
      })
    ];

    return {
      edition: (dayLabel || 'Current day'),
      district: district,
      districtProfile: profile,
      mood: districtInfo.mood,
      concerns: districtInfo.concerns,
      publicLife: districtInfo.publicLife,
      stories: leads,
      explanation: {
        phraseMap: districtInfo.phraseMap,
        localMeaning: function(phraseKey){ return explainPhrase(phraseKey, { district: district }); }
      },
      localState: Object.assign({}, localState, {
        crowding: profile.pulse.crowding,
        trade: profile.pulse.trade,
        tension: profile.pulse.tension,
        publicTrust: profile.pulse.publicTrust
      })
    };
  }

  var api = {
    DISTRICTS: DISTRICTS,
    BUSINESS_TYPES: BUSINESS_TYPES,
    PHRASE_LIBRARY: PHRASE_LIBRARY,
    makeBusinessEntry: makeBusinessEntry,
    makeDistrictProfile: makeDistrictProfile,
    createStoryRecord: createStoryRecord,
    explainPhrase: explainPhrase,
    buildLedgerEdition: buildLedgerEdition,
    generateDistrictPulse: function(label, dayLabel){
      var district = label || 'Nieuw Oranje VII';
      return buildLedgerEdition(dayLabel || 'Current day', district, {});
    }
  };

  if (typeof window !== 'undefined') {
    window.ONUM_CAPITAL_LEDGER = api;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.ONUM_CAPITAL_LEDGER = api;
  }

})();
