/* ============================================================
   blacksunCUBE — Notebook Guard
   Client-side copy deterrence for /notebook/ entries.
   Not cryptographic. View Source / DevTools bypass everything.
   ============================================================ */
(function () {
  'use strict';

  var root = document.querySelector('[data-nb-protected]');
  if (!root) return;

  var toast = document.getElementById('nb-toast');
  var toastTimer;

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.hidden = true; }, 300);
    }, 1600);
  }

  function block(e) {
    e.preventDefault();
    e.stopPropagation();
    showToast();
    return false;
  }

  /* -------- 1. Right-click context menu -------- */
  root.addEventListener('contextmenu', block);

  /* -------- 2. Text selection start -------- */
  root.addEventListener('selectstart', function (e) {
    // Allow interacting with links and buttons
    if (e.target.closest('a, button, input, textarea')) return;
    e.preventDefault();
  });

  /* -------- 3. Copy / Cut events -------- */
  ['copy', 'cut'].forEach(function (evt) {
    root.addEventListener(evt, function (e) {
      if (e.clipboardData) e.clipboardData.setData('text/plain', '');
      e.preventDefault();
      showToast();
    });
  });

  /* -------- 4. Drag (prevents drag-text-to-copy) -------- */
  root.addEventListener('dragstart', block);

  /* -------- 5. Keyboard shortcuts -------- */
  document.addEventListener('keydown', function (e) {
    var key = (e.key || '').toLowerCase();
    var ctrlOrMeta = e.ctrlKey || e.metaKey;

    // CTRL/CMD + C, X, A, S, P, U
    if (ctrlOrMeta && ['c', 'x', 'a', 's', 'p', 'u'].indexOf(key) !== -1) {
      // Let keyboard selection/copy work in form inputs
      if (e.target && e.target.matches && e.target.matches('input, textarea')) return;
      e.preventDefault();
      showToast();
      return;
    }

    // F12 (DevTools) — token gesture, trivially bypassed
    if (key === 'f12') {
      e.preventDefault();
      showToast();
      return;
    }

    // CTRL + SHIFT + (I, J, C) — DevTools on most browsers
    if (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c'].indexOf(key) !== -1) {
      e.preventDefault();
      showToast();
      return;
    }

    // PrintScreen — can't actually block, but we can warn
    if (key === 'printscreen') {
      // Attempt to clear clipboard; mostly symbolic
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (_) {}
      showToast();
    }
  });

  /* -------- 6. Prevent text selection via CSS, reinforced here -------- */
  root.style.webkitUserSelect = 'none';
  root.style.userSelect = 'none';

  /* -------- 7. Clear selection if somehow made -------- */
  document.addEventListener('selectionchange', function () {
    var sel = window.getSelection && window.getSelection();
    if (!sel || !sel.toString()) return;
    if (!sel.anchorNode) return;
    // Only clear if selection is inside protected region
    var node = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
    if (node && root.contains(node)) {
      // Allow selection inside interactive elements
      if (node.closest('a, button, input, textarea')) return;
      sel.removeAllRanges();
    }
  });

})();
