/* Codenotch, rebuilt for TommyOS.

   A port of the UI from vinzdg/codenotch (MIT): the macOS app that pins a black notch to a
   screen edge and fills a ring per AI provider with how much of that vendor's limit you have
   burned. The geometry is theirs rather than eyeballed: their Design.swift derives the whole
   surface from a single anchor: the provider ring is 44pt and measures 117px in their design
   frame, so px(n) = n * 44/117 reproduces their proportions at any size. Palette hexes are the
   ones they sampled off that frame: #303030 track, #00FF88 / #F2FF00 / #FF3F00 bands.

   Two anchors here rather than their one. The strip is set smaller than 44pt because a browser
   desktop is not a Mac bezel and it was dominating the screen; the card keeps their 44pt anchor,
   because the strip is decoration and the card is text somebody has to read. Shrinking both
   together made the body type illegible.

   Our twist is what the rings count. Codenotch shows how much of somebody else's allowance is
   left. Three of these are the desktop's own folders, filling as you open what is inside them,
   so the ring that is reddest is the one you have not looked at yet; the fourth is Little River,
   the estate, which is the opposite point: that floor is ours and it is busy. Their three live
   states carry over unchanged, because Little River already has all three: an arc spins while it
   is working, and it holds amber while approvals are waiting on Tommy.

   The estate's headcount is the frozen snapshot lr.js ships and the card says so. Its load is
   animated, not measured, and the card says that too. */
(function () {
  'use strict';
  var T = window.TR; if (!T) return;
  var host = document.querySelector('.desktop') || document.body; if (!host) return;

  var EDGE = 'left';    /* which screen edge it clings to; the icons live on the right */
  var RING_PT = 28;     /* the strip's anchor. Their spec says 44; smaller suits a browser. */
  var AIR = 0.6;        /* Their padding and cell spacing, tightened. Kept as its own knob so the
                           ring and its label stay in the proportions they drew; only the gaps
                           between cells give, which is where a strip pinned to a browser edge
                           wastes height. Set to 1 for their spacing exactly. */

  var S = RING_PT / 117, SC = 44 / 117;
  function px(n) { return +(n * S).toFixed(2) }     /* strip, at our anchor */
  function air(n) { return +(n * S * AIR).toFixed(2) }
  function cpx(n) { return +(n * SC).toFixed(2) }   /* card, at theirs */
  function fs(v, cap) { return +(v / 0.714).toFixed(2) }  /* their cap-height -> point size */

  /* ---------- the snapshot (kept in step with lr.js) ---------- */
  var STAMP = 'Sat Sep 5, 2026, 7:30 PM';
  var AGENTS = 37, WAITING = 3, DEPT_COUNT = 8;
  /* The floor as lr.js has it: same names, same headcount, same colours, so the card and the
     real command centre cannot drift apart. Unassigned is Tommy himself. */
  var DEPTS = [
    ['Marketing', 11, '#3987e5'], ['Clear Care Dental', 7, '#c98500'], ['Studio', 5, '#199e70'],
    ['Sales', 5, '#d95926'], ['Support', 4, '#d55181'], ['Research', 2, '#9085e9'],
    ['Floor & Chat', 1, '#8b93a3'], ['Runtime', 1, '#8b93a3'], ['Unassigned', 1, '#6c7178']
  ];
  var DEPT_MAX = DEPTS.reduce(function (m, d) { return Math.max(m, d[1]) }, 1);

  var G = {
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c4.4 4.7 4.4 12.3 0 17c-4.4-4.7-4.4-12.3 0-17z"/>',
    pad: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r="1.15"/><circle cx="18.4" cy="13.4" r="1.15"/>',
    mark: '<path d="M12 3.4L20.6 12 12 20.6 3.4 12z"/><circle cx="12" cy="12" r="3"/>'
  };

  /* The desktop's own folders (shell.js FOLDERS), rebuilt from the exported APPS so the
     membership cannot drift from what the Finder shows, plus the estate. */
  var GAMES = { brick: 'Brick Breaker', arena: 'Armagetron', meme: 'Meme Maker', paint: 'Paint' };
  var GROUPS = [
    { key: 'apps', name: 'Apps', glyph: 'grid', cat: 'apps' },
    { key: 'sites', name: 'Websites', glyph: 'globe', cat: 'web' },
    { key: 'games', name: 'Games', glyph: 'pad', keys: Object.keys(GAMES) },
    { key: 'lr', name: 'Little River', glyph: 'mark', estate: true, load: 73 }
  ];
  function members(g) {
    return g.keys || (T.APPS || []).filter(function (a) { return a.category === g.cat }).map(function (a) { return a.key });
  }
  function titleOf(k) {
    var a = (T.APPS || []).filter(function (x) { return x.key === k })[0];
    return a ? a.title : (GAMES[k] || k);
  }

  /* Their bands. For the estate a full ring is a busy floor, so high is the loud one. For a
     folder it is the other way round: an empty ring means you have not looked yet, and that
     is the one worth a red arc. Same three colours either way. */
  function band(p) { return p >= 70 ? 'critical' : p >= 50 ? 'watch' : 'ample' }
  function bandOpened(p) { return p >= 70 ? 'ample' : p >= 35 ? 'watch' : 'critical' }

  /* ---------- what this visitor has opened ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('tr.' + k); return v == null ? d : JSON.parse(v) } catch (e) { return d } },
    set: function (k, v) { try { localStorage.setItem('tr.' + k, JSON.stringify(v)) } catch (e) { } }
  };
  var seen = store.get('seen', []);
  function opened(g) { var m = members(g); return m.filter(function (k) { return seen.indexOf(k) > -1 }).length }
  function pctOf(g) {
    if (g.estate) return g.load;
    var m = members(g); return m.length ? Math.round(opened(g) / m.length * 100) : 0;
  }
  function bandOf(g, p) { return g.estate ? band(p) : bandOpened(p) }

  /* ---------- geometry, all of it theirs ---------- */
  var RING = px(117), TRACK_W = px(15.5), PROG_W = px(8), GLYPH = px(46);
  var R_TRACK = (RING - TRACK_W) / 2, R_PROG = (RING - PROG_W) / 2;
  var C_PROG = 2 * Math.PI * R_PROG;
  var ACT = px(72), ACT_W = px(5.5), R_ACT = (ACT - ACT_W) / 2, C_ACT = 2 * Math.PI * R_ACT;
  var TAIL_H = cpx(87);

  var root = document.createElement('div');
  root.className = 'cn cn-' + EDGE;
  root.id = 'notch';
  root.style.cssText = [
    /* strip, at our anchor */
    '--cn-depth:' + px(186) + 'px', '--cn-curl:' + px(103) + 'px', '--cn-corner:' + px(78.8) + 'px',
    '--cn-pad-t:' + air(69.5) + 'px', '--cn-pad-b:' + air(50.1) + 'px', '--cn-gap:' + air(83.5) + 'px',
    '--cn-ring:' + RING + 'px', '--cn-label-gap:' + px(26.9) + 'px', '--cn-f-pct:' + fs(px(27)) + 'px',
    /* card, at theirs */
    '--cn-card-w:' + cpx(600) + 'px', '--cn-card-r:' + cpx(49.5) + 'px', '--cn-card-p:' + cpx(32) + 'px',
    '--cn-tail-l:' + cpx(75) + 'px', '--cn-tail-h:' + TAIL_H + 'px', '--cn-tail-gap:' + cpx(28) + 'px',
    '--cn-bar-h:' + cpx(10.5) + 'px', '--cn-head-gap:' + cpx(17) + 'px', '--cn-head-block:' + cpx(21) + 'px',
    '--cn-label-bar:' + cpx(16.8) + 'px', '--cn-bar-used:' + cpx(17.8) + 'px', '--cn-block:' + cpx(20) + 'px',
    '--cn-f-title:' + fs(cpx(26)) + 'px', '--cn-f-body:' + fs(cpx(18)) + 'px'
  ].join(';');

  function ringSVG(pct, b) {
    return '<svg class="cn-ring" viewBox="0 0 ' + RING + ' ' + RING + '" aria-hidden="true">' +
      '<circle class="cn-track" cx="' + RING / 2 + '" cy="' + RING / 2 + '" r="' + R_TRACK + '" stroke-width="' + TRACK_W + '"/>' +
      '<circle class="cn-prog b-' + b + '" cx="' + RING / 2 + '" cy="' + RING / 2 + '" r="' + R_PROG + '" stroke-width="' + PROG_W + '" ' +
      'stroke-dasharray="' + (C_PROG * pct / 100).toFixed(2) + ' ' + C_PROG.toFixed(2) + '"/>' +
      '<circle class="cn-act" cx="' + RING / 2 + '" cy="' + RING / 2 + '" r="' + R_ACT + '" stroke-width="' + ACT_W + '" ' +
      'stroke-dasharray="' + (C_ACT * 0.18).toFixed(2) + ' ' + C_ACT.toFixed(2) + '"/></svg>';
  }
  function glyphSVG(k, size) {
    return '<svg class="cn-glyph" viewBox="0 0 24 24"' + (size ? ' width="' + size + '" height="' + size + '"' : '') +
      ' aria-hidden="true">' + G[k] + '</svg>';
  }

  root.innerHTML = '<div class="cn-body">' + GROUPS.map(function (g) {
    var p = pctOf(g);
    return '<button class="cn-cell" data-k="' + g.key + '" aria-label="' + g.name + '">' +
      '<span class="cn-well">' + ringSVG(p, bandOf(g, p)) + glyphSVG(g.glyph, GLYPH) + '</span>' +
      '<span class="cn-pct">' + p + '%</span></button>';
  }).join('') + '</div><div class="cn-card" role="tooltip" hidden><div class="cn-tail"></div><div class="cn-sheet"></div></div>';
  host.appendChild(root);

  var card = root.querySelector('.cn-card'), sheet = root.querySelector('.cn-sheet');
  var cellEls = {};
  root.querySelectorAll('.cn-cell').forEach(function (el) { cellEls[el.dataset.k] = el });

  /* ---------- the card ---------- */
  function block(label, right, pct, b, used) {
    return '<div class="cn-block"><div class="cn-brow"><span>' + label + '</span><span class="cn-dim">' + right + '</span></div>' +
      '<div class="cn-bar"><span class="b-' + b + '" style="width:' + Math.max(pct, 2) + '%"></span></div>' +
      '<div class="cn-used">' + used + '</div></div>';
  }
  function paint(g) {
    var head = '<div class="cn-head">' + glyphSVG(g.glyph) + '<span class="cn-title">' + g.name + '</span></div>';
    if (g.estate) {
      sheet.innerHTML = head +
        block('Floor load', 'right now', g.load, band(g.load), g.load + '% busy') +
        '<div class="cn-sec">' + AGENTS + ' agents · ' + DEPT_COUNT + ' departments</div>' +
        DEPTS.map(function (d) {
          return '<div class="cn-drow"><span class="cn-dname">' + d[0] + '</span>' +
            '<span class="cn-dbar"><span style="width:' + Math.round(d[1] / DEPT_MAX * 100) + '%;background:' + d[2] + '"></span></span>' +
            '<span class="cn-dnum">' + d[1] + '</span></div>';
        }).join('') +
        '<div class="cn-wait"><span class="cn-dot"></span>' + WAITING + ' waiting on you</div>' +
        '<div class="cn-stamp">Headcount from the snapshot of ' + STAMP +
        '. Load is animated, not measured. <a href="https://littleriver.site" target="_blank" rel="noopener">littleriver.site&nbsp;→</a></div>';
      return;
    }
    var m = members(g), n = opened(g), p = pctOf(g);
    var left = m.filter(function (k) { return seen.indexOf(k) < 0 }).map(titleOf);
    sheet.innerHTML = head +
      block('Opened', n + ' of ' + m.length, p, bandOpened(p), p + '% explored') +
      '<div class="cn-stamp">' + (left.length
        ? 'Not yet: ' + left.slice(0, 3).join(', ') + (left.length > 3 ? ' and ' + (left.length - 3) + ' more' : '') + '.<br>Click to open the next one.'
        : 'You opened every one. Genuinely.') + '</div>';
  }

  var openKey = null;
  function show(k) {
    var g = GROUPS.filter(function (x) { return x.key === k })[0]; if (!g) return;
    openKey = k; paint(g); card.hidden = false;
    /* Centre the card on the hovered ring, then keep it on screen; the tail follows, so the
       point still lands on its cell. Measured off rects: the body is centred with
       translateY(-50%) and offsetTop reports the position before that transform. */
    var well = cellEls[k].querySelector('.cn-well');
    var base = root.getBoundingClientRect().top, wr = well.getBoundingClientRect();
    var mid = wr.top + wr.height / 2 - base;
    var h = card.offsetHeight, top = mid - h / 2;
    top = Math.max(8 - base, Math.min(top, window.innerHeight - 8 - h - base));
    card.style.top = top + 'px';
    card.querySelector('.cn-tail').style.top = (mid - top - TAIL_H / 2) + 'px';
  }
  function hide() { card.hidden = true; openKey = null }

  root.querySelectorAll('.cn-cell').forEach(function (el) {
    var k = el.dataset.k;
    el.addEventListener('mouseenter', function () { show(k) });
    el.addEventListener('focus', function () { show(k) });
    el.addEventListener('click', function () {
      hide();
      var g = GROUPS.filter(function (x) { return x.key === k })[0];
      if (g.estate) return void (T.openApp && T.openApp('littleriver'));
      /* open the next thing in this folder you have not seen, more use than the folder itself */
      var m = members(g), next = m.filter(function (x) { return seen.indexOf(x) < 0 })[0] || m[0];
      if (next && T.openApp) T.openApp(next);
    });
  });
  root.addEventListener('mouseleave', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide() });

  /* ---------- live states ---------- */
  var reduce = matchMedia('(prefers-reduced-motion:reduce)');
  /* Asked every tick, not once at startup: Motion is a switch in Control Centre, and a reading
     that keeps drifting after you turn it off is exactly the thing you turned off. */
  function still() { return document.documentElement.classList.contains('still') || reduce.matches }

  function setCell(g) {
    var el = cellEls[g.key]; if (!el) return;
    var p = pctOf(g), prog = el.querySelector('.cn-prog');
    prog.setAttribute('stroke-dasharray', (C_PROG * p / 100).toFixed(2) + ' ' + C_PROG.toFixed(2));
    prog.setAttribute('class', 'cn-prog b-' + bandOf(g, p));
    el.querySelector('.cn-pct').textContent = p + '%';
  }
  function markSeen() {
    var added = false;
    Object.keys(T.openMap || {}).forEach(function (k) { if (seen.indexOf(k) < 0) { seen.push(k); added = true } });
    if (!added) return;
    store.set('seen', seen);
    GROUPS.forEach(function (g) { if (!g.estate) setCell(g) });
    if (openKey && openKey !== 'lr') show(openKey);
  }
  var wins = document.getElementById('windows');
  if (wins && window.MutationObserver) new MutationObserver(markSeen).observe(wins, { childList: true });
  markSeen();

  var estate = GROUPS[GROUPS.length - 1];

  /*  A floor filling up, not a number being shuffled.

      This used to step +/-4.5 every three seconds, which is a random walk: it fell as often as
      it rose and never sat still, so the reading visibly bounced (80, 77, 65, back up) and drew
      the eye every few seconds. Now it creeps a point at a time, mostly upward, and most ticks
      do nothing at all. Between nine and twenty seconds apart, so it is never metronomic and you
      have to be watching to catch it move.

      It has to shed load somewhere or it would just peg at the ceiling, so it eases back down
      near the top rather than being reset. The band boundaries at 50 and 70 are crossed rarely
      enough, at one point a tick, that the ring changes colour as a slow fade rather than a
      flicker.  */
  var LOAD_MIN = 46, LOAD_MAX = 92;
  function driftEstate() {
    if (!still()) {
      var r = Math.random(), step;
      if (r < 0.34) step = 1;        /* the usual: one point up */
      else if (r < 0.44) step = 2;   /* now and then, a little more */
      else if (r < 0.88) step = 0;   /* most ticks it just holds */
      else step = -1;                /* and occasionally it eases */
      if (step > 0 && estate.load >= LOAD_MAX - 2) step = -1;   /* shed rather than peg */
      if (step < 0 && estate.load <= LOAD_MIN + 2) step = 1;
      if (step) {
        estate.load = Math.max(LOAD_MIN, Math.min(LOAD_MAX, estate.load + step));
        setCell(estate);
        refreshOpenEstate();
      }
    }
    setTimeout(driftEstate, 9000 + Math.random() * 11000);
  }

  /*  Update the two things that actually changed rather than repainting the card. Rewriting the
      whole sheet under the pointer re-renders every row while somebody is reading it.  */
  function refreshOpenEstate() {
    if (openKey !== 'lr') return;
    var bar = sheet.querySelector('.cn-bar span'), used = sheet.querySelector('.cn-used');
    if (bar) { bar.style.width = Math.max(estate.load, 2) + '%'; bar.className = 'b-' + band(estate.load) }
    if (used) used.textContent = estate.load + '% busy';
  }

  setTimeout(driftEstate, 9000 + Math.random() * 11000);

  /*  Their ActivityArc: a thinner arc on its own radius, so it reads as a separate fact rather
      than the usage number moving. Only the estate works; a folder is not doing anything.

      It used to flip a coin every 5.2s, so the arc blinked on and off continuously. A job that
      runs takes a while and then stops, so now it spins for one stretch and rests for a longer
      one, both randomised.  */
  function idleEstate() {
    var el = cellEls.lr; if (!el) return;
    el.classList.remove('is-busy');
    setTimeout(busyEstate, 24000 + Math.random() * 26000);
  }
  function busyEstate() {
    var el = cellEls.lr; if (!el) return;
    if (still()) return void setTimeout(busyEstate, 20000);
    el.classList.add('is-busy');
    setTimeout(idleEstate, 7000 + Math.random() * 6000);
  }
  setTimeout(busyEstate, 6000 + Math.random() * 8000);

  if (cellEls.lr) cellEls.lr.classList.add('is-waiting');
})();
