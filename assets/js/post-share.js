/* blacksunCUBE — post share button */
(function () {
  'use strict';

  var btn   = document.getElementById('post-share-btn');
  var toast = document.getElementById('share-toast');
  if (!btn) return;

  var toastTimer;

  function showToast(msg, isError) {
    if (!toast) return;
    var label = toast.querySelector('span');
    if (label && msg) label.textContent = msg;
    toast.classList.toggle('is-error', !!isError);
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.hidden = true; }, 300);
    }, 1800);
  }

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

  btn.addEventListener('click', function () {
    var url = btn.dataset.shareUrl || location.href;
    var title = btn.dataset.shareTitle || document.title;
    var isMobile = /Mobi|Android|iPhone|iPad/.test(navigator.userAgent);

    if (navigator.share && isMobile) {
      navigator.share({ title: title, url: url }).catch(function () {});
      return;
    }
    copyToClipboard(url).then(function () {
      showToast('Post link copied');
    }).catch(function () {
      showToast('Could not copy link', true);
    });
  });
})();
