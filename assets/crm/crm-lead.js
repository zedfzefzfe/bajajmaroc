/* Bajaj Maroc — send test-ride requests to the CRM (Supabase).
   Fire-and-forget: any error is only logged in the console, so it never
   affects EmailJS, the Meta Pixel or the "Merci !" screen. */
(function () {
  'use strict';
  // Supabase project URL + publishable ("anon") key. Never the secret / service_role key.
  var SUPABASE_URL = 'https://atmhogszqcskjedmvhdm.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Ractp8htLqSb0ESxsCs2Og_KTEi7PKz';

  // Meta identifiers for the CRM (Conversions API matching). Read-only: nothing here
  // sets cookies or talks to the pixel. Anything missing becomes '' and never throws.
  function readCookie(name) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) { return ''; }
  }
  function metaIds() {
    var fbc = readCookie('_fbc'), fbp = readCookie('_fbp'), fbclid = '';
    try { fbclid = new URLSearchParams(window.location.search).get('fbclid') || ''; } catch (e) { fbclid = ''; }
    // Ad click without the _fbc cookie yet: build it the way Meta does.
    if (!fbc && fbclid) fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    return { fb_fbc: fbc, fb_fbp: fbp, fb_fbclid: fbclid };
  }

  window.bjSaveLead = function (lead) {
    try {
      if (SUPABASE_URL.indexOf('PASTE_') === 0 || !window.fetch) return;
      var ids = { fb_fbc: '', fb_fbp: '', fb_fbclid: '' };
      try { ids = metaIds(); } catch (e) { /* keep empty strings */ }
      var row = {
        nom: lead.nom,
        telephone: lead.telephone,
        modele: lead.modele || null,
        paiement: lead.paiement || null,
        situation_pro: lead.situation_pro || null,
        source: 'landing',
        fb_fbc: ids.fb_fbc,
        fb_fbp: ids.fb_fbp,
        fb_fbclid: ids.fb_fbclid
      };
      var send = function (body) {
        return fetch(SUPABASE_URL + '/rest/v1/leads', {
          method: 'POST',
          keepalive: true,
          headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify(body)
        });
      };
      send(row).then(function (r) {
        if (r.ok) return;
        return r.text().then(function (t) {
          // Database without one of the newer columns yet: save the lead anyway, without them.
          if (/situation_pro|fb_fb/.test(t)) {
            if (/situation_pro/.test(t)) delete row.situation_pro;
            if (/fb_fb/.test(t)) { delete row.fb_fbc; delete row.fb_fbp; delete row.fb_fbclid; }
            return send(row).then(function (r2) { if (!r2.ok) r2.text().then(function (t2) { console.warn('CRM', r2.status, t2); }); });
          }
          console.warn('CRM', r.status, t);
        });
      }).catch(function (err) { console.warn('CRM', err); });
    } catch (err) { console.warn('CRM', err); }
  };
})();
