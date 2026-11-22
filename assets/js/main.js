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
    var videos = document.querySelectorAll('[data-viewport-video]');
    if (!videos.length || !('IntersectionObserver' in window)) return;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var visible = new Set();
    var manuallyPaused = new Set();

    function play(video) {
      if (reducedMotion.matches || document.hidden || manuallyPaused.has(video)) return;
      video.muted = true;
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    }

    var observer = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          visible.add(video);
          play(video);
        } else {
          visible.delete(video);
          video.pause();
        }
      });
    }, { threshold: 0.15 });

    Array.prototype.forEach.call(videos, function (video) {
      video.addEventListener('pause', function () {
        if (visible.has(video) && !document.hidden && !reducedMotion.matches) manuallyPaused.add(video);
      });
      video.addEventListener('play', function () { manuallyPaused.delete(video); });
      observer.observe(video);
    });

    document.addEventListener('visibilitychange', function () {
      visible.forEach(function (video) {
        if (document.hidden) video.pause();
        else play(video);
      });
    });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', function () {
      visible.forEach(function (video) {
        if (reducedMotion.matches) video.pause();
        else play(video);
      });
    });
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

  var socialLabels = initSocialLabels();
  initClipboard(socialLabels);
  initArchiveBackground();
  initViewportVideos();
  initWorkCursor();

  // The home hero is a CSS-driven marquee, not a scrollable carousel.
  // Its former scroll-indicator loop referenced a removed toggle handler.
}());
