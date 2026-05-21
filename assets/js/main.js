(function () {
  // Populate hero badge links from config.js
  var cfg = window.X_FORESIGHT_CONFIG || {};
  document.querySelectorAll('[data-cfg]').forEach(function (el) {
    var key = el.getAttribute('data-cfg');
    var val = cfg[key];
    if (val && val !== '#') {
      el.setAttribute('href', val);
      el.classList.remove('muted');
    }
  });
  var yearEl = document.getElementById('footer-year');
  if (yearEl && cfg.YEAR) yearEl.textContent = cfg.YEAR;

  // Scroll-spy: highlight the nav item for the section currently in view.
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav .sections a'));
  var sectionIds = navLinks
    .map(function (a) { return a.getAttribute('href'); })
    .filter(function (h) { return h && h.charAt(0) === '#'; })
    .map(function (h) { return h.slice(1); });

  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      var hash = a.getAttribute('href');
      a.classList.toggle('active', hash === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var obs = new IntersectionObserver(function (entries) {
      // Pick the entry with the largest intersection ratio that is intersecting.
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-56px 0px -60% 0px', threshold: [0, 0.2, 0.5] });
    sections.forEach(function (s) { obs.observe(s); });
  }

  // Demo gallery: button picker swaps the source of a single <video>.
  var demoVideo  = document.getElementById('demo-player');
  var demoSource = demoVideo ? demoVideo.querySelector('source') : null;
  var demoLabel  = document.getElementById('demo-label');
  var pickerBtns = Array.prototype.slice.call(document.querySelectorAll('.demo-picker button'));
  pickerBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.getAttribute('data-src');
      if (!src || !demoVideo || !demoSource) return;
      pickerBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      // Append a small media-fragment so the browser seeks past frame 0 and
      // renders that frame as the still preview (works on Chrome/Firefox/Safari).
      demoSource.setAttribute('src', src + '#t=0.1');
      demoVideo.load();
      if (demoLabel) demoLabel.textContent = btn.textContent.trim();
    });
  });

  // Qualitative figure picker: swaps an <img> src and a caption.
  document.querySelectorAll('.qual-picker').forEach(function (picker) {
    var imgId = picker.getAttribute('data-target');
    var capId = picker.getAttribute('data-caption');
    var img = imgId ? document.getElementById(imgId) : null;
    var cap = capId ? document.getElementById(capId) : null;
    var btns = Array.prototype.slice.call(picker.querySelectorAll('button'));
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-src');
        if (!src || !img) return;
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        img.setAttribute('src', src);
        img.setAttribute('alt', 'Qualitative comparison — ' + btn.textContent.trim());
        if (cap) cap.textContent = btn.getAttribute('data-caption') || '';
      });
    });
  });

  // Remember the user's language choice so the toggle is sticky on reload.
  try {
    var page = document.documentElement.getAttribute('lang') || '';
    if (page) localStorage.setItem('xforesight.lang', page.startsWith('zh') ? 'zh' : 'en');
  } catch (e) { /* localStorage may be unavailable on file:// — ignore. */ }
})();
