(function () {
  'use strict';

  function initClipboard() {
    var buttons = document.querySelectorAll('.copied');
    if (!buttons.length || typeof window.Clipboard !== 'function') return;

    var message = document.getElementById('msg');
    var failMessage = document.getElementById('f-msg');
    var footerClick = document.getElementById('foot-btn');
    var footerMessage = document.getElementById('foot-msg');
    var messageTimer;
    var footerTimer;
    var failureTimer;
    var clipboard = new window.Clipboard('.copied');

    clipboard.on('success', function (event) {
      event.clearSelection();
      if (message) {
        message.classList.add('content-open');
        window.clearTimeout(messageTimer);
        messageTimer = window.setTimeout(function () {
          message.classList.remove('content-open');
        }, 2500);
      }
      if (footerClick && footerMessage) {
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
    var links = document.querySelectorAll('.links-item-click');
    var availability = document.querySelector('[data-target="availability"]');

    Array.prototype.forEach.call(links, function (link) {
      var target = link.getAttribute('data-target');
      var labels = Array.prototype.filter.call(document.querySelectorAll('[data-target]'), function (element) {
        return element.getAttribute('data-target') === target;
      });

      function show() {
        labels.forEach(function (label) { label.classList.add('active'); });
        if (availability) availability.classList.remove('active');
      }

      function hide() {
        labels.forEach(function (label) { label.classList.remove('active'); });
        if (availability) availability.classList.add('active');
      }

      link.addEventListener('mouseenter', show);
      link.addEventListener('mouseleave', hide);
      link.addEventListener('focus', show);
      link.addEventListener('blur', hide);
    });
  }

  initClipboard();
  initArchiveBackground();
  initSocialLabels();

  // The home hero is a CSS-driven marquee, not a scrollable carousel.
  // Its former scroll-indicator loop referenced a removed toggle handler.
}());
