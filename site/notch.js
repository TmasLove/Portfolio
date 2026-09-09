/* Codenotch, rebuilt for TommyOS.

   A port of the UI from vinzdg/codenotch (MIT) — the macOS app that pins a black notch to a
   screen edge and fills a ring per AI provider with how much of that vendor's limit you have
   burned. Every measurement below is theirs: their Design.swift derives the whole surface from
   one anchor (the provider ring is 44pt and measures 117px in their design frame), so
   px(n) = n * 44/117 reproduces their proportions exactly rather than by eye. Palette hexes are
   the ones they sampled off that frame — #303030 track, #00FF88 / #F2FF00 / #FF3F00 bands.
   Scale the whole thing by changing S, the way changing Design.scale does in their app.

   Our twist is what the rings count. Codenotch shows how much of somebody else's allowance is
   left; these are the departments of Tommy's own estate, Little River — the point is not what
   is left to rent, it is that the floor is ours and it is busy. Their three live states carry
   over unchanged, because Little River already has all three: an arc spins while a department
   is working, and the ring goes amber when it is waiting on Tommy.

   The estate's headcount is the same frozen snapshot lr.js ships. The load percentages are
   animated, not measured — the card says so, in the same words lr.js uses. */
(function () {
  'use strict';
  var T = window.TR; if (!T) return;
  var host = document.querySelector('.desktop') || document.body; if (!host) return;

  var EDGE = 'left';        /* which screen edge the notch clings to. Their app supports both;
                               ours sits left because TommyOS keeps its desktop icons on the right. */
  var S = 44 / 117;         /* Design.scale — points per pixel of their design frame */
  function px(n) { return +(n * S).toFixed(2) }
  function fs(cap) { return +(px(cap) / 0.714).toFixed(2) }   /* their cap-height -> point size */

  /* ---------- the snapshot (kept in step with lr.js) ---------- */
  var STAMP = 'Sat Sep 5, 2026, 7:30 PM';
  var AGENTS = 37, WAITING = 3;

  var G = {
    megaphone: '<path d="M4 10v4h3l5 4V6L7 10H4z"/><path d="M16.5 9.2a4 4 0 0 1 0 5.6"/>',
    shield: '<path d="M12 3l7 3v6c0 4-3 6.6-7 8-4-1.4-7-4-7-8V6z"/><path d="M9 12l2 2 4-4"/>',
    pen: '<path d="M12 3l4 8-4 10-4-10z"/><path d="M8.2 11h7.6"/>',
    trend: '<path d="M3 17l5-5 3 3 7-7"/><path d="M15 8h5v5"/>',
    buoy: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3l3.4 3.4M14.3 14.3l3.4 3.4M17.7 6.3l-3.4 3.4M9.7 14.3l-3.4 3.4"/>',
    desk: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6"/>'
  };

  /* One cell per department, in the order the floor is organised. `load` is where the animated
     reading starts; `agents` is real, from the snapshot. */
  var CELLS = [
    { key: 'marketing', name: 'Marketing', agents: 11, glyph: 'megaphone', load: 73 },
    { key: 'ccd', name: 'Clear Care Dental', agents: 7, glyph: 'shield', load: 21 },
    { key: 'studio', name: 'Studio', agents: 5, glyph: 'pen', load: 52 },
    { key: 'sales', name: 'Sales', agents: 5, glyph: 'trend', load: 34 },
    { key: 'support', name: 'Support', agents: 4, glyph: 'buoy', load: 88, waiting: WAITING },
    { key: 'visit', name: 'This visit', glyph: 'desk', visit: true }
  ];

  /* Their bands: ample / watch / critical. A ring that is nearly spent is the one you look at. */
  function band(p) { return p >= 70 ? 'critical' : p >= 50 ? 'watch' : 'ample' }

  /* ---------- how much of TommyOS this visitor has opened ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('tr.' + k); return v == null ? d : JSON.parse(v) } catch (e) { return d } },
    set: function (k, v) { try { localStorage.setItem('tr.' + k, JSON.stringify(v)) } catch (e) { } }
  };
  function uniq(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i }) }
  var WORK = uniq((T.APPS || []).map(function (a) { return a.key }));
  var PLAY = uniq((T.DOCK || []).map(function (d) { return d.key })
    .filter(function (k) { return ['trash', 'launchpad', 'finder'].indexOf(k) < 0 })
    .concat(['brick', 'arena', 'meme', 'cycles'])
    .concat(Object.keys(T.PAGES || {})));
  var seen = store.get('seen', []);
  function hits(list) { return seen.filter(function (k) { return list.indexOf(k) > -1 }).length }
  function visitPct() {
    var d = hits(WORK) + hits(PLAY), t = WORK.length + PLAY.length;
    return t ? Math.round(d / t * 100) : 0;
  }

  /* ---------- geometry, all of it theirs ---------- */
  var RING = px(117), TRACK_W = px(15.5), PROG_W = px(8), GLYPH = px(46);
  var R_TRACK = (RING - TRACK_W) / 2, R_PROG = (RING - PROG_W) / 2;
  var C_PROG = 2 * Math.PI * R_PROG;
  var ACT = px(72), ACT_W = px(5.5), R_ACT = (ACT - ACT_W) / 2, C_ACT = 2 * Math.PI * R_ACT;

  var root = document.createElement('div');
  root.className = 'cn cn-' + EDGE;
  root.id = 'notch';
  root.style.cssText = [
    '--cn-depth:' + px(186) + 'px', '--cn-curl:' + px(103) + 'px', '--cn-corner:' + px(78.8) + 'px',
    '--cn-pad-t:' + px(69.5) + 'px', '--cn-pad-b:' + px(50.1) + 'px', '--cn-gap:' + px(83.5) + 'px',
    '--cn-ring:' + RING + 'px', '--cn-label-gap:' + px(26.9) + 'px',
    '--cn-card-w:' + px(600) + 'px', '--cn-card-r:' + px(49.5) + 'px', '--cn-card-p:' + px(32) + 'px',
    '--cn-tail-l:' + px(75) + 'px', '--cn-tail-h:' + px(87) + 'px', '--cn-tail-gap:' + px(28) + 'px',
    '--cn-bar-h:' + px(10.5) + 'px', '--cn-head-gap:' + px(17) + 'px', '--cn-head-block:' + px(21) + 'px',
    '--cn-label-bar:' + px(16.8) + 'px', '--cn-bar-used:' + px(17.8) + 'px', '--cn-block:' + px(20) + 'px',
    '--cn-f-pct:' + fs(27) + 'px', '--cn-f-title:' + fs(26) + 'px', '--cn-f-body:' + fs(18) + 'px'
  ].join(';');

  function ringSVG(pct, cls) {
    var b = band(pct);
    return '<svg class="cn-ring ' + (cls || '') + '" viewBox="0 0 ' + RING + ' ' + RING + '" aria-hidden="true">' +
      '<circle class="cn-track" cx="' + RING / 2 + '" cy="' + RING / 2 + '" r="' + R_TRACK + '" stroke-width="' + TRACK_W + '"/>' +
      '<circle class="cn-prog b-' + b + '" cx="' + RING / 2 + '" cy="' + RING / 2 + '" r="' + R_PROG + '" stroke-width="' + PROG_W + '" ' +
      'stroke-dasharray="' + (C_PROG * pct / 100).toFixed(2) + ' ' + C_PROG.toFixed(2) + '"/>' +
      '<circle class="cn-act" cx="' + RING / 2 + '" cy="' + RING / 2 + '" r="' + R_ACT + '" stroke-width="' + ACT_W + '" ' +
      'stroke-dasharray="' + (C_ACT * 0.18).toFixed(2) + ' ' + C_ACT.toFixed(2) + '"/>' +
      '</svg>';
  }
  function glyphSVG(k) {
    return '<svg class="cn-glyph" viewBox="0 0 24 24" width="' + GLYPH + '" height="' + GLYPH + '" aria-hidden="true">' + G[k] + '</svg>';
  }

  root.innerHTML = '<div class="cn-body">' + CELLS.map(function (c) {
    var p = c.visit ? visitPct() : c.load;
    return '<button class="cn-cell" data-k="' + c.key + '" aria-label="' + c.name + '">' +
      '<span class="cn-well">' + ringSVG(p) + glyphSVG(c.glyph) + '</span>' +
      '<span class="cn-pct">' + p + '%</span></button>';
  }).join('') + '</div><div class="cn-card" role="tooltip" hidden><div class="cn-tail"></div><div class="cn-sheet"></div></div>';
  host.appendChild(root);

  var body = root.querySelector('.cn-body'), card = root.querySelector('.cn-card'), sheet = root.querySelector('.cn-sheet');
  var cellEls = {};
  root.querySelectorAll('.cn-cell').forEach(function (el) { cellEls[el.dataset.k] = el });

  /* ---------- the card ---------- */
  function block(label, right, pct, used) {
    return '<div class="cn-block"><div class="cn-brow"><span>' + label + '</span><span class="cn-dim">' + right + '</span></div>' +
      '<div class="cn-bar"><span class="b-' + band(pct) + '" style="width:' + Math.max(pct, 2) + '%"></span></div>' +
      '<div class="cn-used">' + used + '</div></div>';
  }
  function paint(c) {
    var head = '<div class="cn-head">' + glyphSVG(c.glyph) + '<span class="cn-title">' + c.name + '</span></div>';
    if (c.visit) {
      var w = hits(WORK), p = hits(PLAY);
      sheet.innerHTML = head +
        block('Work', w + ' of ' + WORK.length, Math.round(w / Math.max(WORK.length, 1) * 100), w + ' projects opened') +
        block('Apps &amp; games', p + ' of ' + PLAY.length, Math.round(p / Math.max(PLAY.length, 1) * 100), p + ' opened') +
        '<div class="cn-stamp">' + (w ? 'Keep going — every project is a real app.' : 'Open the Websites folder. That is the actual portfolio.') + '</div>';
      return;
    }
    var share = Math.round(c.agents / AGENTS * 100);
    sheet.innerHTML = head +
      block('Floor load', 'right now', c.load, c.load + '% busy') +
      block('Share of floor', c.agents + ' of ' + AGENTS + ' agents', share, share + '% of the estate') +
      (c.waiting ? '<div class="cn-wait"><span class="cn-dot"></span>' + c.waiting + ' waiting on you</div>' : '') +
      '<div class="cn-stamp">Headcount from the snapshot of ' + STAMP + '. Load is animated, not measured. ' +
      '<a href="https://littleriver.site" target="_blank" rel="noopener">littleriver.site&nbsp;→</a></div>';
  }

  var openKey = null;
  function show(k) {
    var c = CELLS.filter(function (x) { return x.key === k })[0]; if (!c) return;
    openKey = k; paint(c); card.hidden = false;
    /* Centre the card on the hovered ring, then keep it on screen — the tail follows it, so the
       point still lands on the cell it belongs to even once the card has been pushed back into
       view. Measured off rects rather than offsetTop: the body is centred with translateY(-50%),
       and offsetTop reports the position before that transform, which put the card off-screen. */
    var well = cellEls[k].querySelector('.cn-well');
    var base = root.getBoundingClientRect().top;
    var wr = well.getBoundingClientRect();
    var mid = wr.top + wr.height / 2 - base;
    var h = card.offsetHeight, top = mid - h / 2;
    top = Math.max(8 - base, Math.min(top, window.innerHeight - 8 - h - base));
    card.style.top = top + 'px';
    card.querySelector('.cn-tail').style.top = (mid - top - px(87) / 2) + 'px';
  }
  function hide() { card.hidden = true; openKey = null }

  root.querySelectorAll('.cn-cell').forEach(function (el) {
    var k = el.dataset.k;
    el.addEventListener('mouseenter', function () { show(k) });
    el.addEventListener('focus', function () { show(k) });
    el.addEventListener('click', function () {
      hide();
      if (k === 'visit') { T.openPage && T.openPage('work') }
      else { T.openApp && T.openApp('littleriver') }
    });
  });
  root.addEventListener('mouseleave', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide() });

  /* ---------- live states ---------- */
  /* Asked on every tick, not once at startup: Motion is a switch in Control Centre, and a
     reading that keeps drifting after you turn it off is exactly the thing you turned off. */
  var reduce = matchMedia('(prefers-reduced-motion:reduce)');
  function still() { return document.documentElement.classList.contains('still') || reduce.matches }

  function setCell(c) {
    var el = cellEls[c.key]; if (!el) return;
    var p = c.visit ? visitPct() : c.load;
    var prog = el.querySelector('.cn-prog');
    prog.setAttribute('stroke-dasharray', (C_PROG * p / 100).toFixed(2) + ' ' + C_PROG.toFixed(2));
    prog.setAttribute('class', 'cn-prog b-' + band(p));
    el.querySelector('.cn-pct').textContent = p + '%';
  }
  function markSeen() {
    var added = false;
    Object.keys(T.openMap || {}).forEach(function (k) { if (seen.indexOf(k) < 0) { seen.push(k); added = true } });
    if (added) {
      store.set('seen', seen);
      setCell(CELLS[CELLS.length - 1]);
      if (openKey === 'visit') show('visit');
    }
  }
  var wins = document.getElementById('windows');
  if (wins && window.MutationObserver) new MutationObserver(markSeen).observe(wins, { childList: true });
  markSeen();

  /* the readings drift, the way a measurement does; the support desk keeps its amber
     because something is genuinely waiting on you there. */
  setInterval(function () {
    if (still()) return;
    CELLS.forEach(function (c) {
      if (c.visit) return;
      c.load = Math.max(6, Math.min(96, Math.round(c.load + (Math.random() * 9 - 4.5))));
      setCell(c);
    });
    if (openKey && openKey !== 'visit') paint(CELLS.filter(function (x) { return x.key === openKey })[0]);
  }, 3000);

  /* one department is working at a time — their ActivityArc, a thinner arc on its own radius
     so it reads as a separate fact rather than the usage number moving. */
  var busy = null;
  setInterval(function () {
    if (busy && cellEls[busy]) { cellEls[busy].classList.remove('is-busy'); busy = null }
    if (still()) return;
    busy = CELLS[Math.floor(Math.random() * (CELLS.length - 1))].key;
    cellEls[busy].classList.add('is-busy');
  }, 5200);
  if (cellEls.support) cellEls.support.classList.add('is-waiting');
})();
