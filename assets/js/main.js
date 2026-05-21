/* blacksunCUBE  minimal UI script */
(function () {
  'use strict';

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var KEY = 'bsc-theme';

  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* noop */ }
  }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }

  // Initial theme: stored > system > light
  var stored = getStored();
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(stored || (prefersDark ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        store(next);
      });
    }

    /* ---------- Mobile drawer ---------- */
    var burger = document.querySelector('[data-nav-toggle]');
    var drawer = document.querySelector('[data-nav-drawer]');
    if (burger && drawer) {
      burger.addEventListener('click', function () {
        var open = drawer.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(open));
      });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          drawer.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* ---------- External link safety ---------- */
    // Enforce target/rel for any external http(s) link that missed it.
    var host = location.hostname;
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      try {
        var u = new URL(a.href);
        if (u.hostname !== host) {
          if (!a.target) a.target = '_blank';
          var rel = (a.rel || '').split(' ').filter(Boolean);
          if (rel.indexOf('noopener') === -1) rel.push('noopener');
          if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
          a.rel = rel.join(' ');
        }
      } catch (e) { /* noop */ }
    });
  });
})();
