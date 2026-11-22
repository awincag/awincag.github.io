(function () {
  'use strict';

  function initClipboard(socialLabels) {
    var buttons = document.querySelectorAll('.copied');
    if (!buttons.length || typeof window.Clipboard !== 'function') return;

    var message = document.getElementById('msg');
    var failMessage = document.getElementById('f-msg');
    var footerClick = document.getElementById('foot-btn');
    var footerMessage = document.getElementById('foot-msg');
    var footerTimer;
    var failureTimer;
    var clipboard = new window.Clipboard('.copied');

    Array.prototype.forEach.call(buttons, function (button) {
      if (button.getAttribute('role') !== 'button' || button.tagName === 'BUTTON') return;
      button.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          button.click();
        }
      });
    });

    clipboard.on('success', function (event) {
      event.clearSelection();
      var trigger = event.trigger;
      var fromHeader = trigger && trigger.closest('.header-socials');
      var fromFooter = trigger && trigger.closest('footer');
      if (fromHeader && socialLabels) socialLabels.showCopied();
      if (fromFooter && footerClick && footerMessage) {
        footerMessage.classList.remove('f-active');
        footerClick.classList.add('f-active');
        window.clearTimeout(footerTimer);
        footerTimer = window.setTimeout(function () {
          footerClick.classList.remove('f-active');
          footerMessage.classList.add('f-active');
        }, 2500);
      }
    });

    clipboard.on('error', function () {
      if (!failMessage) return;
      failMessage.classList.add('content-open');
      window.clearTimeout(failureTimer);
      failureTimer = window.setTimeout(function () {
        failMessage.classList.remove('content-open');
      }, 5500);
    });

    Array.prototype.forEach.call(document.querySelectorAll('.closebtn'), function (button) {
      button.addEventListener('click', function () {
        if (message) message.classList.remove('active', 'content-open');
        if (failMessage) failMessage.classList.remove('active', 'content-open');
      });
    });
  }

  function initArchiveBackground() {
    var archive = document.querySelector('.archive');
    if (!archive) return;

    function updateBackground() {
      var y = Math.min(255, Math.max(0, Math.round(1 + (window.scrollY || window.pageYOffset || 0) / 2.25)));
      archive.style.backgroundColor = 'rgb(' + y + ', ' + y + ', ' + y + ')';
    }

    window.addEventListener('scroll', updateBackground, { passive: true });
  }

  function initSocialLabels() {
    var header = document.querySelector('.header-socials');
    if (!header) return null;

    var labels = Array.prototype.slice.call(header.querySelectorAll('.header-text .socials-status'));
    var links = header.querySelectorAll('.links-item-click');
    var hovered = null;
    var focused = null;
    var copied = false;
    var timer;

    function render() {
      var target = copied ? 'copied' : (hovered || focused || 'availability');
      labels.forEach(function (label) {
        var visible = label.getAttribute('data-target') === target;
        label.classList.toggle('active', visible);
        label.classList.remove('content-open');
        label.setAttribute('aria-hidden', String(!visible));
      });
    }

    Array.prototype.forEach.call(links, function (link) {
      var target = link.getAttribute('data-target');
      link.addEventListener('mouseenter', function () { hovered = target; render(); });
      link.addEventListener('mouseleave', function () { if (hovered === target) hovered = null; render(); });
      link.addEventListener('focus', function () { focused = target; render(); });
      link.addEventListener('blur', function () { if (focused === target) focused = null; render(); });
    });

    render();

    return {
      showCopied: function () {
        copied = true;
        window.clearTimeout(timer);
        render();
        timer = window.setTimeout(function () { copied = false; render(); }, 2500);
      }
    };
  }

  function initViewportVideos() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('[data-viewport-video]'));
    if (!videos.length) return;
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var pausedByUser = new Set();
    var manuallyStarted = new Set();
    var reported = new Set();
    var frame = null;

    function sync(video) {
      var rect = video.getBoundingClientRect();
      var visible = rect.width > 0 && rect.height > 0 &&
        rect.bottom > 0 && rect.top < window.innerHeight &&
        rect.right > 0 && rect.left < window.innerWidth;
      var shouldPlay = visible && !document.hidden && !pausedByUser.has(video) &&
        (!motion.matches || manuallyStarted.has(video));

      video.autoplay = shouldPlay;
      if (!shouldPlay) {
        if (!video.paused) video.pause();
        return;
      }

      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      if (!video.paused) return;
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function (error) {
        if (error.name !== 'AbortError' && !reported.has(video)) {
          reported.add(video);
          console.warn('Portfolio video playback:', video.currentSrc || video.src, error);
        }
      });
    }

    function update() {
      frame = null;
      videos.forEach(sync);
    }

    function schedule() {
      if (frame === null) frame = window.requestAnimationFrame(update);
    }

    videos.forEach(function (video) {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = false;

      function toggle() {
        if (video.paused) {
          pausedByUser.delete(video);
          manuallyStarted.add(video);
        } else {
          pausedByUser.add(video);
        }
        sync(video);
      }

      video.addEventListener('loadedmetadata', schedule);
      video.addEventListener('canplay', schedule);
      video.addEventListener('error', function () {
        console.warn('Portfolio media error:', video.currentSrc || video.src, video.error);
      });
      video.addEventListener('click', toggle);
      video.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('load', schedule);
    document.addEventListener('visibilitychange', update);
    if (motion.addEventListener) motion.addEventListener('change', update);
    if ('IntersectionObserver' in window) {
      var observer = new window.IntersectionObserver(schedule, { threshold: [0, 0.01] });
      videos.forEach(function (video) { observer.observe(video); });
    }
    update();
  }

  function initWorkCursor() {
    var hero = document.querySelector('[data-work-cursor]');
    if (!hero) return;
    var cursor = hero.querySelector('.work-cursor');
    if (!cursor || !window.matchMedia || !window.requestAnimationFrame) return;

    var finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var pointer = null;
    var frame = null;

    function hide() {
      pointer = null;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      hero.classList.remove('work-cursor-active');
    }

    function update() {
      frame = null;
      if (!pointer || !finePointer.matches || reducedMotion.matches) {
        hide();
        return;
      }

      var rect = hero.getBoundingClientRect();
      var left = Math.max(rect.left, 0);
      var right = Math.min(rect.right, document.documentElement.clientWidth);
      var top = Math.max(rect.top, 0);
      var bottom = Math.min(rect.bottom, document.documentElement.clientHeight);
      if (pointer.x < left || pointer.x >= right || pointer.y < top || pointer.y >= bottom) {
        hide();
        return;
      }

      // Keep the label centered on the pointer, rather than clamping it
      // to an inset boundary. Fade it out before its circle is clipped.
      var radius = Math.max(cursor.offsetWidth, cursor.offsetHeight) / 2;
      var distance = Math.min(pointer.x - left, right - pointer.x, pointer.y - top, bottom - pointer.y);
      var t = Math.max(0, Math.min(1, (distance - radius) / 48));
      var opacity = t * t * (3 - 2 * t);

      hero.style.setProperty('--work-cursor-x', (pointer.x - rect.left - hero.clientLeft) + 'px');
      hero.style.setProperty('--work-cursor-y', (pointer.y - rect.top - hero.clientTop) + 'px');
      hero.style.setProperty('--work-cursor-opacity', String(opacity));
      hero.classList.toggle('work-cursor-active', opacity > 0);
    }

    function schedule() {
      if (pointer && frame === null) frame = window.requestAnimationFrame(update);
    }

    function move(event) {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        hide();
        return;
      }
      if (!finePointer.matches || reducedMotion.matches) { hide(); return; }
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    }

    hero.addEventListener('pointerenter', move);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', hide);
    hero.addEventListener('pointercancel', hide);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) hide();
    });
    [finePointer, reducedMotion].forEach(function (query) {
      if (query.addEventListener) query.addEventListener('change', hide);
    });
  }

  initViewportVideos();
  var socialLabels = initSocialLabels();
  initClipboard(socialLabels);
  initArchiveBackground();
  initWorkCursor();

  // The home hero is a CSS-driven marquee, not a scrollable carousel.
  // Its former scroll-indicator loop referenced a removed toggle handler.
}());
