(function () {
  'use strict';
  var root = document.documentElement;

  // Theme toggle
  var themeBtn = document.querySelector('.theme-toggle');
  function syncThemeLabel() {
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  syncThemeLabel();
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeLabel();
  });

  // Mobile nav
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('nav-links');
  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Timeline expand / collapse
  var items = Array.prototype.slice.call(document.querySelectorAll('.tl-item'));
  function setOpen(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.tl-head').setAttribute('aria-expanded', String(open));
  }
  items.forEach(function (item) {
    item.querySelector('.tl-head').addEventListener('click', function () {
      setOpen(item, !item.classList.contains('is-open'));
      syncToggleAll();
    });
  });
  var toggleAll = document.getElementById('toggle-all');
  function syncToggleAll() {
    var allOpen = items.every(function (i) { return i.classList.contains('is-open'); });
    toggleAll.textContent = allOpen ? 'Collapse all' : 'Expand all';
    toggleAll.setAttribute('aria-pressed', String(allOpen));
  }
  toggleAll.addEventListener('click', function () {
    var allOpen = items.every(function (i) { return i.classList.contains('is-open'); });
    items.forEach(function (i) { setOpen(i, !allOpen); });
    syncToggleAll();
  });

  // Skill filters
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var skills = Array.prototype.slice.call(document.querySelectorAll('#skills-grid li'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      skills.forEach(function (s) {
        var areas = (s.getAttribute('data-area') || '').split(' ');
        s.classList.toggle('hidden', f !== 'all' && areas.indexOf(f) === -1);
      });
    });
  });

  // Active nav link on scroll
  if ('IntersectionObserver' in window) {
    var links = {};
    Array.prototype.forEach.call(navLinks.querySelectorAll('a'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          links[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ========== Portfolio interactives ========== */

  // Generic tab/stepper helper
  function initStepper(rootEl) {
    var tabs = Array.prototype.slice.call(rootEl.querySelectorAll('.stepper-tabs [role="tab"]'));
    var panels = Array.prototype.slice.call(rootEl.querySelectorAll('.step-panel'));
    var dots = Array.prototype.slice.call(rootEl.querySelectorAll('.step-dots .dot'));
    var prev = rootEl.querySelector('.step-prev');
    var next = rootEl.querySelector('.step-next');
    var current = 0;
    var n = panels.length;

    function go(i) {
      if (i < 0 || i >= n) return;
      current = i;
      tabs.forEach(function (t, idx) {
        var on = idx === current;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, idx) {
        var on = idx === current;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === current);
        if (idx === current) d.setAttribute('aria-current', 'step');
        else d.removeAttribute('aria-current');
      });
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === n - 1;
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { go(+t.getAttribute('data-step')); });
      t.addEventListener('keydown', function (e) {
        var i = current;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(Math.min(n - 1, i + 1)); tabs[Math.min(n - 1, i + 1)].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(Math.max(0, i - 1)); tabs[Math.max(0, i - 1)].focus(); }
        if (e.key === 'Home') { e.preventDefault(); go(0); tabs[0].focus(); }
        if (e.key === 'End') { e.preventDefault(); go(n - 1); tabs[n - 1].focus(); }
      });
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(+d.getAttribute('data-step')); });
    });
    if (prev) prev.addEventListener('click', function () { go(current - 1); });
    if (next) next.addEventListener('click', function () { go(current + 1); });

    // Touch swipe on panels
    var panelsWrap = rootEl.querySelector('.stepper-panels');
    if (panelsWrap) {
      var sx = 0;
      panelsWrap.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].screenX; }, { passive: true });
      panelsWrap.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].screenX - sx;
        if (Math.abs(dx) > 50) go(dx < 0 ? current + 1 : current - 1);
      }, { passive: true });
    }

    go(0);
    return { go: go };
  }

  function initTabs(rootEl) {
    var tabs = Array.prototype.slice.call(rootEl.querySelectorAll('.tab-list [role="tab"]'));
    var panels = Array.prototype.slice.call(rootEl.querySelectorAll('.tab-panel'));
    function go(i) {
      tabs.forEach(function (t, idx) {
        var on = idx === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, idx) {
        var on = idx === i;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { go(+t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t);
        if (e.key === 'ArrowRight') { e.preventDefault(); var n = (i + 1) % tabs.length; go(n); tabs[n].focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); var p = (i - 1 + tabs.length) % tabs.length; go(p); tabs[p].focus(); }
      });
    });
    go(0);
  }

  /* --- Carlsberg ladder (synthetic HKD) --- */
  var LADDER = {
    '1kc': {
      label: 'per can · 1KC',
      brands: [
        { name: 'Carlsberg', sub: 'Danish Pilsner', prices: [14.9, 12.9, 11.9, 9.9] },
        { name: 'Heineken', sub: 'same segment', prices: [15.9, 13.9, 12.5, 10.9] },
        { name: 'Budweiser', sub: 'same segment', prices: [13.9, 11.9, 10.9, 9.5] }
      ]
    },
    '4pk': {
      label: 'per can equiv · 4-pack',
      brands: [
        { name: 'Carlsberg', sub: 'Danish Pilsner', prices: [12.5, 11.0, 10.0, 8.8] },
        { name: 'Heineken', sub: 'same segment', prices: [13.2, 11.8, 10.8, 9.5] },
        { name: 'Budweiser', sub: 'same segment', prices: [11.8, 10.5, 9.8, 8.5] }
      ]
    },
    '6pk': {
      label: 'per can equiv · 6-pack',
      brands: [
        { name: 'Carlsberg', sub: 'Danish Pilsner', prices: [11.5, 10.2, 9.3, 8.2] },
        { name: 'Heineken', sub: 'same segment', prices: [12.2, 10.9, 9.9, 8.8] },
        { name: 'Budweiser', sub: 'same segment', prices: [10.9, 9.7, 8.9, 7.9] }
      ]
    }
  };
  var TIERS = ['EDLP', 'PSP1', 'PSP2', 'PSP3'];

  function renderLadder(pack) {
    var chart = document.getElementById('ladder-chart');
    if (!chart) return;
    var data = LADDER[pack];
    var max = 18;
    var html = '';
    data.brands.forEach(function (b) {
      html += '<div class="ladder-row"><div class="ladder-brand">' + b.name + '<small>' + b.sub + ' · ' + data.label + '</small></div><div class="ladder-bars">';
      b.prices.forEach(function (p, i) {
        var h = Math.round((p / max) * 48);
        var promo = i > 0 ? ' is-promo' : '';
        html += '<div class="bar-cell' + promo + '"><span class="bar" style="height:' + h + 'px"></span><span class="tier">' + TIERS[i] + '</span><span class="price">$' + p.toFixed(1) + '</span></div>';
      });
      html += '</div></div>';
    });
    chart.innerHTML = html;
  }

  var packBtns = Array.prototype.slice.call(document.querySelectorAll('.pack-toggle .seg'));
  packBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      packBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      renderLadder(btn.getAttribute('data-pack'));
    });
  });
  renderLadder('1kc');

  /* Scenario planning — synthetic directional deltas */
  var tierNames = ['EDLP', 'PSP1', 'PSP2', 'PSP3'];
  var packPushNames = ['Low', 'Medium', 'High'];

  function updateScenario() {
    var tierEl = document.getElementById('sc-tier');
    var freqEl = document.getElementById('sc-freq');
    var packEl = document.getElementById('sc-pack');
    if (!tierEl) return;
    var tier = +tierEl.value;
    var freq = +freqEl.value;
    var pack = +packEl.value;

    document.getElementById('tier-label').textContent = tierNames[tier];
    tierEl.setAttribute('aria-valuetext', tierNames[tier]);
    document.getElementById('freq-label').textContent = String(freq);
    document.getElementById('pack-push-label').textContent = packPushNames[pack];

    // Baseline: PSP2, 6 weeks, med pack push → 0
    // Deeper tier → +vol, -NS quality, -GPAL
    // Higher freq → +vol (diminishing), -GPAL
    // Pack push → +vol quality, +NS, +GPAL
    var vol = (tier - 2) * 3 + (freq - 6) * 1.5 + (pack - 1) * 2;
    var ns = (2 - tier) * 2.5 + (6 - freq) * 0.8 + (pack - 1) * 3;
    var gp = (2 - tier) * 3.5 + (6 - freq) * 1.2 + (pack - 1) * 2.5;

    function fmt(v) {
      if (Math.abs(v) < 0.05) return { text: 'flat', cls: '' };
      var s = (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
      return { text: s, cls: v > 0.3 ? 'up' : v < -0.3 ? 'down' : '' };
    }
    var vF = fmt(vol), nF = fmt(ns), gF = fmt(gp);
    var vEl = document.getElementById('imp-vol');
    var nEl = document.getElementById('imp-ns');
    var gEl = document.getElementById('imp-gp');
    vEl.textContent = vF.text; vEl.className = vF.cls;
    nEl.textContent = nF.text; nEl.className = nF.cls;
    gEl.textContent = gF.text; gEl.className = gF.cls;

    var note = '';
    if (tier >= 3 && freq >= 8) note = 'Deep cuts + high frequency: volume may spike, but net sales and GPAL usually soften — demo pattern.';
    else if (pack >= 2 && tier <= 2) note = 'Strong pack-conversion push with controlled depth: often the cleaner trade-off on volume quality.';
    else if (freq <= 3) note = 'Sparse calendar: less promo noise, but you may leave volume on the table vs peers.';
    else note = 'Nudge the sliders — watch how tier depth, frequency and pack push pull volume vs GPAL in opposite directions.';
    document.getElementById('scenario-note').textContent = note;
  }

  ['sc-tier', 'sc-freq', 'sc-pack'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateScenario);
      el.addEventListener('change', updateScenario);
    }
  });
  updateScenario();

  var carlsbergStepper = document.querySelector('[data-stepper="carlsberg"]');
  if (carlsbergStepper) initStepper(carlsbergStepper);

  /* --- Moonzen chain --- */
  var CHAIN = {
    rm: {
      title: 'Raw material purchase',
      body: 'Malt, hops, yeast and adjuncts — negotiate supplier terms, lead times and quality specs. GM view: cash tied in ingredients vs brew schedule risk.',
      bi: 'BI cue: open POs, inbound ETA, cost/hl vs plan.'
    },
    inv: {
      title: 'Raw materials & finished-goods inventory',
      body: 'Balance cellar / cold-store stock with sell-out. Too thin risks stock-outs; too thick burns working capital and shelf life.',
      bi: 'BI cue: days-of-cover by SKU, ageing lots, RM vs FG split.'
    },
    batch: {
      title: 'Current production batch status',
      body: 'Live view of brews in tank — fermentation stage, gravity checks, holds. Escalations when a batch slips the packaging window.',
      bi: 'BI cue: batches in progress, yield variance, QA holds.'
    },
    pack: {
      title: 'Packaging runs',
      body: 'Can / bottle / keg lines scheduled against demand and tank readiness. Changeovers and mini-runs eat efficiency.',
      bi: 'BI cue: line utilisation, planned vs actual cases, scrap.'
    },
    wh: {
      title: 'Warehousing',
      body: 'Pick-face discipline, FEFO for craft SKUs, space for seasonal peaks and event volumes.',
      bi: 'BI cue: warehouse occupancy, pick accuracy, slow movers.'
    },
    log: {
      title: 'Logistics',
      body: 'Deliveries to on-trade, retail and events — route density, cold-chain and cut-off times.',
      bi: 'BI cue: on-time delivery, cost per drop, failed deliveries.'
    },
    bill: {
      title: 'Billing',
      body: 'Invoice accuracy across B2B accounts, event deposits and online orders — clean billing protects cash collection later.',
      bi: 'BI cue: invoice cycle time, credit notes, dispute rate.'
    },
    ar: {
      title: 'Accounts receivable',
      body: 'Income streams: B2B customers, events, online shop. Ageing and credit limits are a GM cash-flow lever.',
      bi: 'BI cue: AR ageing, DSO, top overdue accounts.'
    },
    ap: {
      title: 'Accounts payable',
      body: 'Suppliers and vendors — maltsters, packaging, logistics partners. Align payment terms with cash from AR.',
      bi: 'BI cue: AP due calendar, early-pay discounts taken.'
    },
    plan: {
      title: 'Production planning',
      body: 'Close the loop: demand signal → brew plan → packaging → inventory targets. The AGM seat is where trade-offs get decided.',
      bi: 'BI cue: plan attainment, capacity vs pipeline, SKU prioritisation.'
    },
    brand: {
      title: 'Branding, marketing & new craft ideas',
      body: 'Seasonal drops, collabs and tap-room stories — fed by what production can actually brew and what AR shows is selling.',
      bi: 'BI cue: new-SKU sell-through, event ROI, brand mix.'
    }
  };

  function showChain(id) {
    var d = CHAIN[id];
    var el = document.getElementById('chain-detail');
    if (!d || !el) return;
    el.innerHTML = '<h4>' + d.title + '</h4><p>' + d.body + '</p><p class="bi-cue">' + d.bi + '</p>';
  }

  var chainNodes = Array.prototype.slice.call(document.querySelectorAll('.chain-node'));
  chainNodes.forEach(function (node) {
    node.addEventListener('click', function () {
      chainNodes.forEach(function (n) {
        n.classList.remove('is-active');
        n.setAttribute('aria-pressed', 'false');
      });
      node.classList.add('is-active');
      node.setAttribute('aria-pressed', 'true');
      showChain(node.getAttribute('data-node'));
    });
  });
  showChain('rm');

  /* --- MBA tabs --- */
  var mbaTabs = document.querySelector('[data-tabs="mba"]');
  if (mbaTabs) initTabs(mbaTabs);

  /* --- Agentic AI · cognitive gaming evidence --- */
  var aiStepper = document.querySelector('[data-stepper="ai-gamer"]');
  if (aiStepper) initStepper(aiStepper);

  var BENEFITS = {
    action: {
      note: 'Action / FPS literature (Bediou, Wang): strongest replicated signals on attention, spatial cognition, and perception — especially cross-sectional; intervention effects are smaller.',
      cards: [
        { h: 'Top-down attention', num: 'Attention', p: 'Selective / sustained attention under clutter. Literature metric: Hedges’ g on attention batteries (e.g. Bediou CS g ≈ 0.63).' },
        { h: 'Spatial cognition', num: 'Spatial', p: 'Mental rotation, spatial arrays, useful field of view. CS spatial g ≈ 0.75 in Bediou 2018; INT spatial smaller.' },
        { h: 'Perception', num: 'Perception', p: 'Fast visual discrimination and peripheral processing. CS perception among the largest action effects; INT more cautious.' }
      ]
    },
    rts: {
      note: 'RTS / strategy: flexibility and switching are the headline story (Glass 2013; Basak 2008). Saija 2023 training meta shows modest overall g with weak genre prediction.',
      cards: [
        { h: 'Cognitive flexibility', num: 'Flexibility', p: 'Task-switching and set-shifting under dual goals. Glass 2013 (StarCraft) reports a large flexibility gain vs Sims (Bayes factor ≈ 40.8) — off the g-axis callout.' },
        { h: 'Selective attention', num: 'Attention', p: 'Filtering relevant units / alerts. Saija attention/perception g ≈ 0.27 as a training-effect anchor.' },
        { h: 'Higher-order cognition', num: 'Executive', p: 'Planning and multi-constraint control. Saija higher-order g ≈ 0.31; Basak η² on switching / WM kept as callouts.' }
      ]
    },
    puzzle: {
      note: 'Commercial brain-training / puzzle (Bonnechère 2020): small near-transfer on speed and WM/executive; verbal memory weaker; far transfer remains disputed.',
      cards: [
        { h: 'Processing speed', num: 'Speed', p: 'Timed perceptual / motor speed drills. Bonnechère SMD ≈ 0.40 — the largest near-transfer in that meta.' },
        { h: 'Working memory (near)', num: 'Memory', p: 'Near-transfer WM tasks. SMD ≈ 0.21 — real but small; don’t promise far-transfer IQ.' },
        { h: 'Executive (near)', num: 'Executive', p: 'Inhibition / switching drills close to the game. SMD ≈ 0.21; Sala et al. 2018 urge caution on far transfer.' }
      ]
    }
  };

  function renderBenefits(genre) {
    var data = BENEFITS[genre];
    var grid = document.getElementById('ai-benefit-cards');
    var note = document.getElementById('ai-benefit-note');
    if (!data || !grid) return;
    var html = '';
    data.cards.forEach(function (c, i) {
      html += '<div class="gap-card' + (i === 0 ? ' highlight' : '') + '"><h4>' + c.h + '</h4>' +
        '<p class="gap-num mid">' + c.num + '</p><p>' + c.p + '</p></div>';
    });
    grid.innerHTML = html;
    if (note) note.textContent = data.note;
    Array.prototype.forEach.call(document.querySelectorAll('[data-benefit-genre]'), function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-benefit-genre') === genre);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-benefit-genre]'), function (b) {
    b.addEventListener('click', function () { renderBenefits(b.getAttribute('data-benefit-genre')); });
  });

  var genreCards = Array.prototype.slice.call(document.querySelectorAll('#ai-genre-grid .ai-genre-card'));
  genreCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var g = card.getAttribute('data-genre');
      genreCards.forEach(function (c) {
        var on = c === card;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      renderBenefits(g);
    });
  });
  renderBenefits('action');

  /* Evidence scatter — published points only */
  var DOMAIN_COLORS = {
    attention: '#2f6fd0',
    spatial: '#1d9a6c',
    perception: '#c45c26',
    flexibility: '#7b5cff',
    memory: '#c9a227',
    speed: '#0d9488',
    overall: '#5a6478'
  };
  var GENRE_X = { action: 0, rts: 1, puzzle: 2 };
  var GENRE_LABEL = { action: 'Action / FPS', rts: 'RTS / Strategy', puzzle: 'Puzzle / Brain' };

  // jitter so overlapping g values remain tappable
  var SCATTER_POINTS = [
    // Bediou et al. 2018 Psych Bulletin doi:10.1037/bul0000130
    { id: 'b18-cs-perc', genre: 'action', domain: 'perception', g: 0.78, design: 'cs', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'CS perception', note: '' },
    { id: 'b18-cs-att', genre: 'action', domain: 'attention', g: 0.63, design: 'cs', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'CS top-down attention', note: '' },
    { id: 'b18-cs-spa', genre: 'action', domain: 'spatial', g: 0.75, design: 'cs', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'CS spatial cognition', note: '' },
    { id: 'b18-cs-multi', genre: 'action', domain: 'attention', g: 0.55, design: 'cs', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'CS multitasking', note: '' },
    { id: 'b18-cs-inh', genre: 'action', domain: 'flexibility', g: 0.31, design: 'cs', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'CS inhibition', note: '' },
    { id: 'b18-int-ov', genre: 'action', domain: 'overall', g: 0.34, design: 'int', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'INT overall', note: '' },
    { id: 'b18-int-spa', genre: 'action', domain: 'spatial', g: 0.45, design: 'int', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'INT spatial', note: '' },
    { id: 'b18-int-att', genre: 'action', domain: 'attention', g: 0.31, design: 'int', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'INT top-down attention', note: '' },
    { id: 'b18-int-perc', genre: 'action', domain: 'perception', g: 0.23, design: 'int', cite: 'Bediou et al., Psychological Bulletin', year: 2018, doi: '10.1037/bul0000130', label: 'INT perception', note: 'Non-significant / cautious — include for honesty.' },
    // Wang et al. 2016 Front Psychol PMC4911405
    { id: 'w16-ov', genre: 'action', domain: 'overall', g: 0.58, design: 'int', cite: 'Wang et al., Frontiers in Psychology', year: 2016, doi: 'PMC4911405', label: 'INT overall (d)', note: 'Cohen’s d ≈ g for display.' },
    { id: 'w16-speed', genre: 'action', domain: 'speed', g: 0.81, design: 'int', cite: 'Wang et al., Frontiers in Psychology', year: 2016, doi: 'PMC4911405', label: 'Young adults processing speed / attention (d)', note: '' },
    { id: 'w16-vis', genre: 'action', domain: 'spatial', g: 0.70, design: 'int', cite: 'Wang et al., Frontiers in Psychology', year: 2016, doi: 'PMC4911405', label: 'Young adults visuospatial (d)', note: '' },
    { id: 'w16-exec', genre: 'action', domain: 'flexibility', g: 0.64, design: 'int', cite: 'Wang et al., Frontiers in Psychology', year: 2016, doi: 'PMC4911405', label: 'Young adults executive (d)', note: '' },
    // Bediou / Green update ~2023 doi:10.1037/tmb0000102
    { id: 'b23-cs', genre: 'action', domain: 'overall', g: 0.64, design: 'cs', cite: 'Bediou / Green update (TMB)', year: 2023, doi: '10.1037/tmb0000102', label: 'CS overall', note: '' },
    { id: 'b23-int', genre: 'action', domain: 'overall', g: 0.30, design: 'int', cite: 'Bediou / Green update (TMB)', year: 2023, doi: '10.1037/tmb0000102', label: 'INT overall', note: '' },
    // Saija et al. 2023 PLOS One doi:10.1371/journal.pone.0285925
    { id: 's23-ov', genre: 'rts', domain: 'overall', g: 0.25, design: 'int', cite: 'Saija et al., PLOS One', year: 2023, doi: '10.1371/journal.pone.0285925', label: 'Overall cognition', note: 'Genre labels were weak predictors; gameplay features mattered.' },
    { id: 's23-att', genre: 'rts', domain: 'attention', g: 0.27, design: 'int', cite: 'Saija et al., PLOS One', year: 2023, doi: '10.1371/journal.pone.0285925', label: 'Attention / perception', note: '' },
    { id: 's23-hoc', genre: 'rts', domain: 'flexibility', g: 0.31, design: 'int', cite: 'Saija et al., PLOS One', year: 2023, doi: '10.1371/journal.pone.0285925', label: 'Higher-order cognition', note: '' },
    { id: 's23-mem', genre: 'rts', domain: 'memory', g: -0.14, design: 'int', cite: 'Saija et al., PLOS One', year: 2023, doi: '10.1371/journal.pone.0285925', label: 'Memory', note: 'Non-significant / negative — plotted for honesty.' },
    // Bonnechère et al. 2020 Sci Rep doi:10.1038/s41598-020-72281-3
    { id: 'bn20-spd', genre: 'puzzle', domain: 'speed', g: 0.40, design: 'int', cite: 'Bonnechère et al., Scientific Reports', year: 2020, doi: '10.1038/s41598-020-72281-3', label: 'Processing speed (SMD)', note: '' },
    { id: 'bn20-wm', genre: 'puzzle', domain: 'memory', g: 0.21, design: 'int', cite: 'Bonnechère et al., Scientific Reports', year: 2020, doi: '10.1038/s41598-020-72281-3', label: 'Working memory (SMD)', note: '' },
    { id: 'bn20-exec', genre: 'puzzle', domain: 'flexibility', g: 0.21, design: 'int', cite: 'Bonnechère et al., Scientific Reports', year: 2020, doi: '10.1038/s41598-020-72281-3', label: 'Executive function (SMD)', note: '' },
    { id: 'bn20-verb', genre: 'puzzle', domain: 'memory', g: 0.12, design: 'int', cite: 'Bonnechère et al., Scientific Reports', year: 2020, doi: '10.1038/s41598-020-72281-3', label: 'Verbal memory (SMD)', note: '' }
  ];

  // stable per-point jitter on x within genre lane
  SCATTER_POINTS.forEach(function (p, i) {
    var hash = (i * 17 + p.g * 100) % 7;
    p._jx = GENRE_X[p.genre] + (hash - 3) * 0.06;
  });

  var scatterFilter = { genre: 'all', domain: 'all' };
  var scatterChart = null;
  var chartLoading = false;

  function showPointDetail(p) {
    var el = document.getElementById('ai-point-detail');
    if (!el || !p) return;
    var designLabel = p.design === 'cs' ? 'Cross-sectional' : 'Intervention';
    var warn = p.note ? '<span class="pill warn">Caution</span>' : '';
    el.innerHTML = '<h4>' + p.label + ' · g = ' + p.g.toFixed(2) + '</h4>' +
      '<div class="meta">' +
      '<span class="pill">' + GENRE_LABEL[p.genre] + '</span>' +
      '<span class="pill">' + p.domain + '</span>' +
      '<span class="pill">' + designLabel + '</span>' + warn +
      '</div>' +
      '<p><strong>' + p.cite + ' (' + p.year + ')</strong> · ' + p.doi + '</p>' +
      (p.note ? '<p>' + p.note + '</p>' : '');
  }

  function filteredPoints() {
    return SCATTER_POINTS.filter(function (p) {
      if (scatterFilter.genre !== 'all' && p.genre !== scatterFilter.genre) return false;
      if (scatterFilter.domain !== 'all' && p.domain !== scatterFilter.domain) return false;
      return true;
    });
  }

  function buildDatasets(points) {
    // two datasets for legend/shape: CS circles, INT triangles
    function toData(list) {
      return list.map(function (p) {
        return {
          x: p._jx,
          y: p.g,
          point: p,
          backgroundColor: DOMAIN_COLORS[p.domain] || '#5a6478',
          borderColor: DOMAIN_COLORS[p.domain] || '#5a6478'
        };
      });
    }
    var cs = points.filter(function (p) { return p.design === 'cs'; });
    var intp = points.filter(function (p) { return p.design === 'int'; });
    return [
      {
        label: 'Cross-sectional',
        data: toData(cs),
        pointStyle: 'circle',
        pointRadius: 7,
        pointHoverRadius: 10,
        backgroundColor: function (ctx) {
          var raw = ctx.raw; return raw && raw.backgroundColor ? raw.backgroundColor : '#2f6fd0';
        },
        borderColor: function (ctx) {
          var raw = ctx.raw; return raw && raw.borderColor ? raw.borderColor : '#2f6fd0';
        },
        borderWidth: 1.5
      },
      {
        label: 'Intervention',
        data: toData(intp),
        pointStyle: 'triangle',
        pointRadius: 8,
        pointHoverRadius: 11,
        backgroundColor: function (ctx) {
          var raw = ctx.raw; return raw && raw.backgroundColor ? raw.backgroundColor : '#2f6fd0';
        },
        borderColor: function (ctx) {
          var raw = ctx.raw; return raw && raw.borderColor ? raw.borderColor : '#2f6fd0';
        },
        borderWidth: 1.5
      }
    ];
  }

  function chartColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      text: dark ? '#a3adc2' : '#5a6478',
      grid: dark ? '#26324a' : '#dfe4ee',
      zero: dark ? '#8fb3ff' : '#1d3a6e'
    };
  }

  function renderScatter() {
    var canvas = document.getElementById('ai-scatter');
    if (!canvas || typeof Chart === 'undefined') return;
    var points = filteredPoints();
    var cols = chartColors();
    var datasets = buildDatasets(points);

    // Chart.js needs per-point colors as arrays when not using scriptable in all versions — set arrays
    datasets.forEach(function (ds) {
      ds.backgroundColor = ds.data.map(function (d) { return d.backgroundColor; });
      ds.borderColor = ds.data.map(function (d) { return d.borderColor; });
    });

    if (scatterChart) {
      scatterChart.data.datasets = datasets;
      scatterChart.options.scales.x.ticks.color = cols.text;
      scatterChart.options.scales.y.ticks.color = cols.text;
      scatterChart.options.scales.x.grid.color = cols.grid;
      scatterChart.options.scales.y.grid.color = cols.grid;
      scatterChart.update();
      return;
    }

    scatterChart = new Chart(canvas, {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 280 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) {
                var p = items[0] && items[0].raw && items[0].raw.point;
                return p ? p.label : '';
              },
              label: function (item) {
                var p = item.raw && item.raw.point;
                if (!p) return '';
                return [
                  GENRE_LABEL[p.genre] + ' · ' + p.domain,
                  'g / SMD = ' + p.g.toFixed(2) + ' · ' + (p.design === 'cs' ? 'cross-sectional' : 'intervention'),
                  p.cite + ' (' + p.year + ')'
                ];
              }
            }
          }
        },
        scales: {
          x: {
            min: -0.45,
            max: 2.45,
            ticks: {
              color: cols.text,
              callback: function (val) {
                if (Math.abs(val - 0) < 0.01) return 'Action';
                if (Math.abs(val - 1) < 0.01) return 'RTS';
                if (Math.abs(val - 2) < 0.01) return 'Puzzle';
                return '';
              },
              stepSize: 1
            },
            grid: { color: cols.grid },
            title: { display: true, text: 'Game genre', color: cols.text, font: { size: 12, weight: '600' } }
          },
          y: {
            title: { display: true, text: "Effect size (Hedges' g / SMD)", color: cols.text, font: { size: 12, weight: '600' } },
            ticks: { color: cols.text },
            grid: { color: cols.grid },
            suggestedMin: -0.3,
            suggestedMax: 1.0
          }
        },
        onClick: function (evt, elements) {
          if (!elements.length) return;
          var el = elements[0];
          var ds = scatterChart.data.datasets[el.datasetIndex];
          var raw = ds.data[el.index];
          if (raw && raw.point) showPointDetail(raw.point);
        }
      }
    });
  }

  function loadChartJs(cb) {
    if (typeof Chart !== 'undefined') { cb(); return; }
    if (chartLoading) {
      var t = setInterval(function () {
        if (typeof Chart !== 'undefined') { clearInterval(t); cb(); }
      }, 50);
      return;
    }
    chartLoading = true;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4';
    s.async = true;
    s.onload = function () { chartLoading = false; cb(); };
    s.onerror = function () { chartLoading = false; console.error('Chart.js failed to load'); };
    document.head.appendChild(s);
  }

  function ensureScatter() {
    loadChartJs(function () { renderScatter(); });
  }

  // Genre / domain filter chips
  Array.prototype.forEach.call(document.querySelectorAll('[data-scatter-genre]'), function (btn) {
    btn.addEventListener('click', function () {
      scatterFilter.genre = btn.getAttribute('data-scatter-genre');
      Array.prototype.forEach.call(document.querySelectorAll('[data-scatter-genre]'), function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      ensureScatter();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-scatter-domain]'), function (btn) {
    btn.addEventListener('click', function () {
      scatterFilter.domain = btn.getAttribute('data-scatter-domain');
      Array.prototype.forEach.call(document.querySelectorAll('[data-scatter-domain]'), function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      ensureScatter();
    });
  });

  // Lazy-init chart when evidence step shown
  if (aiStepper) {
    var aiTabs = aiStepper.querySelectorAll('.stepper-tabs [role="tab"]');
    Array.prototype.forEach.call(aiTabs, function (t) {
      t.addEventListener('click', function () {
        if (+t.getAttribute('data-step') === 2) ensureScatter();
      });
    });
    var aiDots = aiStepper.querySelectorAll('.step-dots .dot');
    Array.prototype.forEach.call(aiDots, function (d) {
      d.addEventListener('click', function () {
        if (+d.getAttribute('data-step') === 2) ensureScatter();
      });
    });
    var nextBtn = aiStepper.querySelector('.step-next');
    var prevBtn = aiStepper.querySelector('.step-prev');
    function checkEvidenceStep() {
      var active = aiStepper.querySelector('.step-panel.is-active');
      if (active && active.getAttribute('data-step') === '2') ensureScatter();
    }
    if (nextBtn) nextBtn.addEventListener('click', function () { setTimeout(checkEvidenceStep, 0); });
    if (prevBtn) prevBtn.addEventListener('click', function () { setTimeout(checkEvidenceStep, 0); });
  }

  // Re-tint chart on theme toggle
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      if (scatterChart) setTimeout(function () { renderScatter(); }, 0);
    });
  }

  /* Agentic implication pipe */
  var AGENT = {
    goal: {
      title: 'Goal intake',
      body: 'Ask what to improve: attention under clutter, spatial skill, cognitive flexibility, or light speed / WM practice. Refuse vague “make me smarter” goals.',
      bi: 'Mindset: goal first — then pick the evidence lane.'
    },
    rec: {
      title: 'Recommend genre',
      body: 'Map goal → genre using the scatter: attention / spatial → action; flexibility → RTS; near-transfer speed / WM → puzzle / brain-training.',
      bi: 'Cite the paper class (CS vs INT) so the user sees correlational vs causal weight.'
    },
    dose: {
      title: 'Dosage hypothesis',
      body: 'Propose distributed play — action literature often uses ≥8–10 hours across sessions — as a testable plan, not a promise.',
      bi: 'RGM cue: treat hours like a promo test window with a clear stop rule.'
    },
    track: {
      title: 'Track near-transfer',
      body: 'Pre/post tasks close to the claimed domain (e.g. useful field of view, task-switching cost). Ignore vanity streak counters.',
      bi: 'Measure what the meta-analyses actually measured.'
    },
    kill: {
      title: 'Kill / keep',
      body: 'If near-transfer tasks don’t move after the planned window, stop or switch genre. Don’t escalate dosage to chase far-transfer IQ myths.',
      bi: 'Honest stop-loss — same discipline as a promo kill decision.'
    }
  };

  function showAgent(id) {
    var d = AGENT[id];
    var el = document.getElementById('ai-agent-detail');
    if (!d || !el) return;
    el.innerHTML = '<h4>' + d.title + '</h4><p>' + d.body + '</p><p class="bi-cue">' + d.bi + '</p>';
  }

  var agentSteps = Array.prototype.slice.call(document.querySelectorAll('#ai-agent-pipe .ai-pipe-step'));
  agentSteps.forEach(function (node) {
    node.addEventListener('click', function () {
      agentSteps.forEach(function (n) {
        n.classList.remove('is-active');
        n.setAttribute('aria-pressed', 'false');
      });
      node.classList.add('is-active');
      node.setAttribute('aria-pressed', 'true');
      showAgent(node.getAttribute('data-agent'));
    });
  });
  showAgent('goal');


})();
