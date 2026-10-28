/* Bajaj Maroc — send test-ride requests to the CRM (Supabase).
   Fire-and-forget: any error is only logged in the console, so it never
   affects EmailJS, the Meta Pixel or the "Merci !" screen. */
(function () {
  'use strict';
  // Supabase project URL + publishable ("anon") key. Never the secret / service_role key.
  var SUPABASE_URL = 'https://atmhogszqcskjedmvhdm.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Ractp8htLqSb0ESxsCs2Og_KTEi7PKz';

  window.bjSaveLead = function (lead) {
    try {
      if (SUPABASE_URL.indexOf('PASTE_') === 0 || !window.fetch) return;
      var row = {
        nom: lead.nom,
        telephone: lead.telephone,
        modele: lead.modele || null,
        paiement: lead.paiement || null,
        situation_pro: lead.situation_pro || null,
        source: 'landing'
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
          // Database without the situation_pro column yet: save the lead anyway, without it.
          if (/situation_pro/.test(t)) {
            delete row.situation_pro;
            return send(row).then(function (r2) { if (!r2.ok) r2.text().then(function (t2) { console.warn('CRM', r2.status, t2); }); });
          }
          console.warn('CRM', r.status, t);
        });
      }).catch(function (err) { console.warn('CRM', err); });
    } catch (err) { console.warn('CRM', err); }
  };
})();
