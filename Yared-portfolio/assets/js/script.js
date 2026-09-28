/* ==========================================================================
   BETY — PORTFOLIO SCRIPT
   Handles: mobile nav, navbar shrink, scroll-reveal, thread-nav progress,
   hero typing effect, footer year, mailto contact form.
   ========================================================================== */
(function(){
  "use strict";

  var sections = Array.prototype.slice.call(document.querySelectorAll('.section[id]'));

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar shrink on scroll ---------- */
  var navbar = document.getElementById('navbar');
  function onNavScroll(){
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });

    /* Fallback safety net: fast programmatic jumps (e.g. clicking a thread-nav
       dot triggers a large smooth scrollIntoView) can occasionally outrun the
       observer's callback timing in some browsers. On scroll/resize, sweep for
       any reveal element that is already within the viewport but was never
       marked in-view, and reveal it directly. */
    var sweepTimer = null;
    function sweepReveals(){
      var vh = window.innerHeight;
      revealEls.forEach(function(el){
        if (el.classList.contains('in-view')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0){
          el.classList.add('in-view');
          io.unobserve(el);
        }
      });
    }
    function scheduleSweep(){
      if (sweepTimer) return;
      sweepTimer = setTimeout(function(){ sweepTimer = null; sweepReveals(); }, 120);
    }
    window.addEventListener('scroll', scheduleSweep, { passive: true });
    window.addEventListener('resize', scheduleSweep);
    setTimeout(sweepReveals, 900);
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- Thread nav: active node + progress fill ---------- */
  var threadFill = document.getElementById('threadFill');
  var threadNodesWrap = document.getElementById('threadNodes');
  var threadNodes = threadNodesWrap ? Array.prototype.slice.call(threadNodesWrap.children) : [];
  var navAnchorLinks = document.querySelectorAll('.nav-links a[data-section]');

  function setActiveSection(id){
    threadNodes.forEach(function(li){
      li.classList.toggle('active', li.getAttribute('data-section') === id);
    });
    navAnchorLinks.forEach(function(a){
      a.classList.toggle('active', a.getAttribute('data-section') === id);
    });
  }

  threadNodes.forEach(function(li){
    var btn = li.querySelector('button');
    btn.addEventListener('click', function(){
      var id = li.getAttribute('data-section');
      var target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  var scrollProgressBar = document.getElementById('scrollProgressBar');
  var threadSvg = document.querySelector('.thread-line');

  function updateScrollUI(){
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? scrollTop / max : 0;

    if (scrollProgressBar) scrollProgressBar.style.width = (pct * 100) + '%';

    if (threadFill && threadSvg){
      var h = threadSvg.clientHeight || 1;
      threadFill.setAttribute('y2', (pct * h) + '');
    }

    /* Determine active section: the one whose top is closest to viewport's upper third */
    var viewportMarker = scrollTop + window.innerHeight * 0.35;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++){
      if (sections[i].offsetTop <= viewportMarker) current = sections[i];
    }
    if (current) setActiveSection(current.id);
  }
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI);

  /* ---------- Cursor glow (desktop) ---------- */
  var cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    window.addEventListener('mousemove', function(e){
      cursorGlow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      cursorGlow.classList.add('active');
    }, { passive: true });
    document.addEventListener('mouseleave', function(){ cursorGlow.classList.remove('active'); });
  }

  /* ---------- Hero typing effect ---------- */
  var typedEl = document.getElementById('typedText');
  var phrases = [
    'Aspiring AI Engineer',
    'Python & Machine Learning',
    'AI + IoT Builder',
    'Zayed Sustainability Prize Finalist',
    'Team Leader & Tutor'
  ];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typedEl){
    if (reduceMotion){
      typedEl.textContent = phrases.join('  ·  ');
    } else {
      (function typeLoop(){
        var phraseIndex = 0, charIndex = 0, deleting = false;

        function tick(){
          var current = phrases[phraseIndex];
          if (!deleting){
            charIndex++;
            typedEl.textContent = current.slice(0, charIndex);
            if (charIndex === current.length){
              deleting = true;
              return setTimeout(tick, 1500);
            }
          } else {
            charIndex--;
            typedEl.textContent = current.slice(0, charIndex);
            if (charIndex === 0){
              deleting = false;
              phraseIndex = (phraseIndex + 1) % phrases.length;
            }
          }
          setTimeout(tick, deleting ? 35 : 65);
        }
        tick();
      })();
    }
  }

  /* ---------- Image slots: load image if the file exists, else show placeholder ---------- */
  document.querySelectorAll('[data-src]').forEach(function(el){
    var src = el.getAttribute('data-src');
    var label = el.getAttribute('data-label');
    if (label){
      var span = document.createElement('span');
      span.className = 'slot-label';
      span.innerHTML = '<b>+</b>' + label + '<small>' + src + '</small>';
      el.appendChild(span);
    }
    var img = new Image();
    img.onload = function(){
      el.style.backgroundImage = 'url("' + src + '")';
      el.classList.add('loaded');
      el.setAttribute('data-full', src);
    };
    img.src = src;
  });

  /* ---------- Lightbox for certificates & gallery ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb ? lb.querySelector('img') : null;
  document.addEventListener('click', function(e){
    var slot = e.target.closest('.cert-card .img-slot.loaded, .gallery-grid .img-slot.loaded');
    if (slot && lb){ lbImg.src = slot.getAttribute('data-full'); lb.classList.add('open'); }
    else if (lb && lb.classList.contains('open')){ lb.classList.remove('open'); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && lb) lb.classList.remove('open');
  });

})();
