(function () {
  // Mark <html> as JS-enabled so CSS animations only kick in when we can
  // also control them (no-JS users get the content immediately).
  document.documentElement.classList.add('js');

  var reducedMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Reading-progress bar -----------------------------------------------
  var progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    function updateProgress() {
      var top = window.scrollY || document.documentElement.scrollTop || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = max > 0 ? Math.min(top / max * 100, 100) + '%' : '0';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  // ---- Section fade-in ----------------------------------------------------
  if (!reducedMotion && 'IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          sectionObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('section').forEach(function (s) { sectionObs.observe(s); });
  } else {
    // Reduced-motion or no IO: show everything immediately.
    document.querySelectorAll('section').forEach(function (s) { s.classList.add('in-view'); });
  }

  // ---- Hero stat counter --------------------------------------------------
  function parseStat(text) {
    var m = String(text).match(/^([\d.]+)(.*)$/);
    if (!m) return null;
    return {
      target: parseFloat(m[1]),
      suffix: m[2],
      isFloat: m[1].indexOf('.') >= 0
    };
  }
  function easeOutCubic(p) { return 1 - Math.pow(1 - p, 3); }
  function animateCount(el, target, suffix, isFloat, duration) {
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var progress = Math.min((t - start) / duration, 1);
      var current = target * easeOutCubic(progress);
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    }
    requestAnimationFrame(step);
  }
  var kvBlock = document.querySelector('.kv');
  if (kvBlock && !reducedMotion && 'IntersectionObserver' in window) {
    var nums = Array.prototype.slice.call(kvBlock.querySelectorAll('.num'));
    var parsed = nums.map(function (n) {
      var p = parseStat(n.textContent.trim());
      return p ? Object.assign({ el: n }, p) : null;
    }).filter(Boolean);
    var kvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        parsed.forEach(function (p) {
          p.el.textContent = (p.isFloat ? '0.0' : '0') + p.suffix;
          animateCount(p.el, p.target, p.suffix, p.isFloat, 1200);
        });
        kvObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    kvObs.observe(kvBlock);
  }

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

  // ---- Figure lightbox ----------------------------------------------------
  (function () {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = '<button class="lightbox-close" aria-label="Close (Esc)" type="button">×</button><img alt="" />';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var lbClose = lb.querySelector('.lightbox-close');

    function open(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('figure img').forEach(function (img) {
      img.addEventListener('click', function () {
        open(img.currentSrc || img.src, img.alt);
      });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === lbClose) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
  })();

  // ---- Mobile nav hamburger -----------------------------------------------
  var navToggle = document.querySelector('.nav-toggle');
  var navList = document.querySelector('.nav ul.sections');
  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- BibTeX copy button -------------------------------------------------
  var pageLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  var copiedLabel = pageLang.indexOf('zh') === 0 ? '已复制' : 'Copied';
  document.querySelectorAll('.bibtex-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.parentNode.querySelector('.bibtex');
      if (!pre) return;
      var text = pre.textContent;
      var orig = btn.textContent;
      function ok() {
        btn.textContent = copiedLabel;
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 1500);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(ok).catch(function () { /* ignore */ });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });
  });

  // Remember the user's language choice so the toggle is sticky on reload.
  try {
    var page = document.documentElement.getAttribute('lang') || '';
    if (page) localStorage.setItem('xforesight.lang', page.startsWith('zh') ? 'zh' : 'en');
  } catch (e) { /* localStorage may be unavailable on file:// — ignore. */ }
})();
