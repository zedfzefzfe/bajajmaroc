/* Bajaj Maroc — floating "book a test ride" button.
   Shows the button once the visitor has scrolled past most of the first screen
   (the hero already has its own buttons), and hides it while the mobile menu is open. */
(function () {
  'use strict';
  var btn = document.querySelector('.bj-ride');
  if (!btn) return;
  var header = document.getElementById('bjj-site-header');
  function update() {
    var past = window.scrollY > window.innerHeight * 0.6;
    var menuOpen = header && header.classList.contains('bjj-mobmenu-open');
    btn.classList.toggle('bj-ride-in', past && !menuOpen);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (header) new MutationObserver(update).observe(header, { attributes: true, attributeFilter: ['class'] });
  update();
})();
