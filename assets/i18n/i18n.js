/* Bajaj Maroc — FR / EN / AR language switcher.
   The pages are written in French (with a few English labels). On load, every
   text node, a few attributes (placeholder, alt, aria-label, title, button
   values), the <title> and the meta description are looked up in the
   dictionary (dict.js) and swapped for the chosen language. Text added later
   by page scripts (form messages, counters, sliders) is caught by a
   MutationObserver. Changing language stores the choice and reloads the page,
   so translation always starts from the original markup.
   The <head> snippet on every page sets <html lang/dir> before anything renders. */
(function () {
  'use strict';

  var LANGS = ['fr', 'en', 'ar'];
  var LABELS = { fr: 'Français', en: 'English', ar: 'العربية' };
  var KEY = 'bj-lang';

  function stored() {
    try { var v = localStorage.getItem(KEY); if (LANGS.indexOf(v) > -1) return v; } catch (e) {}
    return 'fr';
  }
  var lang = stored();
  var D = window.BJ_I18N || { t: {}, h: {}, rules: {} };

  function norm(s) { return s.replace(/[\s  ]+/g, ' ').trim(); }

  // Dictionary entries hold { en, ar, fr }; a missing language keeps the source text.
  function lookup(src) {
    var e = D.t[src];
    if (e && e[lang] != null) return e[lang];
    var rules = D.rules[lang];
    if (!rules) return null;
    var out = src;
    for (var i = 0; i < rules.length; i++) out = out.replace(rules[i][0], rules[i][1]);
    return out === src ? null : out;
  }

  var written = new WeakMap(); // node -> value we wrote, so our own writes are not re-translated

  function translateText(node) {
    var v = node.nodeValue;
    if (!v || written.get(node) === v) return;
    var p = node.parentNode;
    if (!p || p.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.nodeName)) return;
    var src = norm(v);
    if (!src || !/[A-Za-zÀ-ÿ]/.test(src)) return;
    var t = lookup(src);
    if (t == null) return;
    var lead = /^\s/.test(v) ? ' ' : '', trail = /\s$/.test(v) ? ' ' : '';
    var nv = lead + t + trail;
    written.set(node, nv);
    node.nodeValue = nv;
  }

  var ATTRS = ['placeholder', 'alt', 'aria-label', 'title'];
  var writtenAttr = new WeakMap();
  function translateAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (!v) continue;
      var done = writtenAttr.get(el);
      if (done && done[a] === v) continue;
      var t = lookup(norm(v));
      if (t == null) continue;
      if (!done) writtenAttr.set(el, done = {});
      done[a] = t;
      el.setAttribute(a, t);
    }
    if (el.nodeName === 'INPUT' && /^(submit|button)$/i.test(el.type) && el.value) {
      var tv = lookup(norm(el.value));
      if (tv != null) el.value = tv;
    }
  }

  // Paragraphs whose sentence is split by <strong>/<br> are translated whole (dict "h").
  function blockKey(el) {
    var s = '';
    (function walk(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) s += c.nodeValue;
        else if (c.nodeName === 'BR') s += ' ';
        else if (c.nodeType === 1) walk(c);
      }
    })(el);
    return norm(s);
  }
  function translateBlocks(root) {
    var seen = [];
    var marks = root.querySelectorAll ? root.querySelectorAll('br,strong,b,em') : [];
    for (var i = 0; i < marks.length; i++) {
      var el = marks[i].parentElement;
      if (!el || seen.indexOf(el) > -1) continue;
      seen.push(el);
      var e = D.h[blockKey(el)];
      if (e && e[lang] != null) {
        el.innerHTML = e[lang];
        var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
        while ((n = w.nextNode())) written.set(n, n.nodeValue);
      }
    }
  }

  function translateTree(root) {
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(root.nodeName)) return;
    translateBlocks(root);
    translateAttrs(root);
    var els = root.querySelectorAll('[placeholder],[alt],[aria-label],[title],input[type=submit],input[type=button]');
    for (var i = 0; i < els.length; i++) translateAttrs(els[i]);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) translateText(n);
  }

  function translateHead() {
    var t = lookup(norm(document.title));
    if (t != null) document.title = t;
    var md = document.querySelector('meta[name="description"]');
    if (md) { var d = lookup(norm(md.content)); if (d != null) md.content = d; }
  }

  function setLang(l) {
    if (l === lang) return;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    location.reload();
  }

  var GLOBE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5S9.4 5.1 12 2.5z"/></svg>';

  function buildSwitcher() {
    var box = document.getElementById('bj-lang');
    if (!box) return;
    var items = LANGS.map(function (l) {
      return '<li><button type="button" role="menuitemradio" aria-checked="' + (l === lang) + '" data-lang="' + l + '" lang="' + l + '">' + LABELS[l] + '</button></li>';
    }).join('');
    box.innerHTML =
      '<button type="button" class="bj-lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="' + LABELS[lang] + '">' +
      GLOBE + '<span>' + lang.toUpperCase() + '</span></button>' +
      '<ul class="bj-lang-menu" role="menu">' + items + '</ul>';
    var btn = box.querySelector('.bj-lang-btn');
    function open(on) { box.classList.toggle('bj-lang-open', on); btn.setAttribute('aria-expanded', on); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(!box.classList.contains('bj-lang-open')); });
    box.querySelector('.bj-lang-menu').addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]');
      if (b) setLang(b.getAttribute('data-lang'));
    });
    document.addEventListener('click', function () { open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
    // Pages that hide the CTA (e.g. /test-ride/) need the switcher's own edge spacing.
    var cta = document.querySelector('#bjj-site-header .bjj-cta-wrap');
    if (!cta || getComputedStyle(cta).display === 'none') box.classList.add('bj-lang-edge');
  }

  function start() {
    buildSwitcher();
    translateHead();
    translateTree(document.body);
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') translateText(m.target);
        else if (m.type === 'attributes') translateAttrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) translateTree(m.addedNodes[j]);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    document.documentElement.classList.remove('bj-i18n-pending');
  }

  window.bjI18n = { lang: lang, set: setLang };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
