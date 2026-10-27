/* Bajaj Maroc — send test-ride requests to the CRM (Supabase).
   Fire-and-forget: any error is only logged in the console, so it never
   affects EmailJS, the Meta Pixel or the "Merci !" screen. */
(function () {
  'use strict';
  // Supabase project URL + publishable ("anon") key. Never the secret / service_role key.
  var SUPABASE_URL = 'PASTE_SUPABASE_URL';
  var SUPABASE_KEY = 'PASTE_ANON_KEY';

  window.bjSaveLead = function (lead) {
    try {
      if (SUPABASE_URL.indexOf('PASTE_') === 0 || !window.fetch) return;
      fetch(SUPABASE_URL + '/rest/v1/leads', {
        method: 'POST',
        keepalive: true,
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          nom: lead.nom,
          telephone: lead.telephone,
          modele: lead.modele || null,
          paiement: lead.paiement || null,
          source: 'landing'
        })
      }).then(function (r) {
        if (!r.ok) r.text().then(function (t) { console.warn('CRM', r.status, t); });
      }, function (err) { console.warn('CRM', err); });
    } catch (err) { console.warn('CRM', err); }
  };
})();
