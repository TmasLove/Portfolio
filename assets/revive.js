/* revive.js: the Canary and Rehab Pro pages are static snapshots of an earlier React build of
   this site. The snapshot kept the markup but none of the code that animated it, so every
   scroll-reveal froze at opacity 0 (the content was invisible), the mileage stuck at 0, the
   bars at 0% wide, and the app icon on a single pose. This puts those back with no framework.

   The page itself carries the finished values (the real mileage, the real bar widths, every
   element visible), so with this script missing, blocked, or under reduced motion, the page is
   still complete. The animation is an extra, never a requirement.

   Hooks, set in the HTML:
     data-rv              fade up 28px when scrolled into view (the React reveal, as it was)
     data-count="27639"   counts up from 0 to the value when it comes into view
     data-bar="51"        a bar that grows to that width (percent) when it comes into view
     data-poses="1,2,3,4" an app-icon <img> that shows a different pose each visit */
(function () {
  'use strict';
  window.__rv = 1;   /* tells the head failsafe this script arrived */
  var html = document.documentElement;

  /* A different pose each visit, the way the app picks one on launch. Not motion, so it runs
     even under reduced motion. */
  document.querySelectorAll('img[data-poses]').forEach(function (img) {
    var poses = img.getAttribute('data-poses').split(',');
    var pick = poses[Math.floor(Math.random() * poses.length)];
    img.src = img.getAttribute('src').replace(/pose\d+/, 'pose' + pick);
  });

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { html.classList.remove('rv-on'); return; }

  /* Take over: rewind the counters and bars to zero while they are still off screen. */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  var bars = [].slice.call(document.querySelectorAll('[data-bar]'));
  counters.forEach(function (el) { el.textContent = '0'; });
  bars.forEach(function (el) { el.style.width = '0%'; });
  /* The bar transition is only switched on after the rewind (CSS keys it off rv-go). Otherwise
     a bar already in view would visibly shrink to zero before growing back. */
  void document.body.offsetWidth;
  html.classList.add('rv-go');

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1800;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* One observer for everything. Each element fires once and is let go, so scrolling back up
     does not replay anything. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      if (el.hasAttribute('data-count')) countUp(el);
      else if (el.hasAttribute('data-bar')) el.style.width = el.getAttribute('data-bar') + '%';
      else el.classList.add('rv-in');
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  document.querySelectorAll('[data-rv]').forEach(function (el) { io.observe(el); });
  counters.forEach(function (el) { io.observe(el); });
  /* bars stagger down the list instead of all landing at once */
  bars.forEach(function (el, i) { el.style.transitionDelay = (i * 90) + 'ms'; io.observe(el); });
})();
