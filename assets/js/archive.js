/* ============================================================
   blacksunCUBE — Archive
   Title search, URL hash sync, share-view + per-post share.
   ============================================================ */
(function () {
  'use strict';

  var listEl   = document.getElementById('post-list');
  var searchEl = document.getElementById('post-search');
  var emptyEl  = document.getElementById('empty-state');
  var metaEl   = document.getElementById('result-meta');
  var resetEl  = document.getElementById('reset-filters');
  var shareBtn = document.getElementById('share-btn');
  var toastEl  = document.getElementById('share-toast');
  if (!listEl) return;

  var items = [].slice.call(listEl.querySelectorAll('.post-list__item'));
  var query = '';
  var toastTimer;

  /* ---------- Toast ---------- */
  function showToast(message, isError) {
    if (!toastEl) return;
    var label = toastEl.querySelector('span');
    if (label && message) label.textContent = message;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
      setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 1800);
  }

  /* ---------- Clipboard ---------- */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (e) {
        document.body.removeChild(ta);
        reject(e);
      }
    });
  }

  function shareOrCopy(url, title, toastMsg) {
    var isMobile = /Mobi|Android|iPhone|iPad/.test(navigator.userAgent);
    if (navigator.share && isMobile) {
      navigator.share({ title: title || document.title, url: url })
        .catch(function () { /* user cancelled */ });
      return;
    }
    copyToClipboard(url).then(function () {
      showToast(toastMsg || 'Link copied to clipboard');
    }).catch(function () {
      showToast('Could not copy link', true);
    });
  }

  /* ---------- Apply search filter ---------- */
  function apply() {
    var q = query.trim().toLowerCase();
    var visible = 0;

    items.forEach(function (it) {
      var matchesQuery = !q || (it.dataset.title || '').indexOf(q) !== -1;
      it.hidden = !matchesQuery;
      if (matchesQuery) visible++;
    });

    if (emptyEl) emptyEl.hidden = visible !== 0;

    if (metaEl) {
      if (!q) {
        metaEl.textContent = visible + ' post' + (visible === 1 ? '' : 's');
      } else {
        metaEl.textContent = visible + ' of ' + items.length + ' match' + (visible === 1 ? '' : 'es');
      }
    }
    if (resetEl) resetEl.hidden = !q;
  }

  /* ---------- URL hash sync (shareable searches) ---------- */
  function readHash() {
    var h = location.hash.replace(/^#/, '');
    if (!h) return;
    var params = {};
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) params[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    if (params.q) {
      query = params.q;
      if (searchEl) searchEl.value = params.q;
    }
  }

  function writeHash() {
    if (query) {
      history.replaceState(null, '', '#q=' + encodeURIComponent(query));
    } else if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function buildViewUrl() {
    var url = location.origin + location.pathname;
    if (query) url += '#q=' + encodeURIComponent(query);
    return url;
  }

  /* ---------- Event wiring ---------- */

  if (searchEl) {
    var debounce;
    searchEl.addEventListener('input', function () {
      query = searchEl.value;
      clearTimeout(debounce);
      debounce = setTimeout(function () { writeHash(); apply(); }, 90);
    });
    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { searchEl.value = ''; query = ''; writeHash(); apply(); }
    });
  }

  if (resetEl) {
    resetEl.addEventListener('click', function () {
      query = '';
      if (searchEl) searchEl.value = '';
      writeHash();
      apply();
    });
  }

  // Per-post share buttons
  listEl.addEventListener('click', function (e) {
    var shareEl = e.target.closest('.row-share');
    if (shareEl) {
      e.preventDefault();
      e.stopPropagation();
      var item = shareEl.closest('.post-list__item');
      if (!item) return;
      var url = item.dataset.shareUrl || '';
      var title = item.dataset.shareTitle || '';
      shareOrCopy(url, title, 'Post link copied');
    }
  });

  // Back/forward
  window.addEventListener('hashchange', function () {
    query = '';
    if (searchEl) searchEl.value = '';
    readHash();
    apply();
  });

  // Share-view button
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = buildViewUrl();
      var msg = query ? 'Search link copied' : 'Link copied to clipboard';
      shareOrCopy(url, 'blacksunCUBE — Public', msg);
    });
  }

  /* ---------- Init ---------- */
  readHash();
  apply();
})();
