# Bajaj Morocco — Static Site

A fully static export of the Bajaj Morocco WordPress site (design, content, images,
videos, CSS and JS preserved exactly). No PHP / no WordPress backend required — deployable
to any static host (Vercel, Netlify, GitHub Pages, S3, …).

## Pages
- `/` — Homepage
- `/motorcycle/` — Motorcycle archive
- `/motorcycle/pulsar-n125/`, `/pulsar-n250/`, `/pulsar-rs200/`, `/pulsar-ns-400z/`
- `/test-ride/`, `/concessionnaires/`, `/notre-histoire/`

## Assets
- Theme images/videos and CSS/JS are **self-hosted** in `wp-content/…` and `bajajmorocoo/…`.
- The stylesheet (`main.css`), logo, footer and favicon were pulled from the live server and
  are now bundled locally, so the site does **not** depend on the live WordPress server.
- A few well-known libraries stay on their CDNs (Google Fonts, Font Awesome, Swiper, EmailJS).

## ⚠️ REQUIRED: Set up the forms with EmailJS

The two lead forms send email **directly from the browser via EmailJS** (no backend):
1. **Enquiry pop-up panel** — the main "Schedule your Test Ride" button, on every page
   (fields: `name`, `phone`, `city`, `dealer`, `timeline`, `model`, `whatsapp`).
2. **"Schedule your Test Ride" form** on `/test-ride/`
   (fields: `model`, `name`, `surname`, `telephone`, `email`, `dealership`).

Until you paste your 3 EmailJS IDs, submissions will not be delivered.

### 1. Create a free EmailJS account
1. Go to <https://www.emailjs.com> and sign up (free plan = 200 emails/month).
2. **Email Services → Add New Service** → connect the inbox that should *send* the mail
   (e.g. a Gmail account). Copy the **Service ID** (looks like `service_xxxxxxx`).
3. **Email Templates → Create New Template**:
   - **To Email:** `z.elhaimri@gmail.com`  ← where the leads arrive
   - **From Name / Reply-To:** you can use `{{name}}` and `{{email}}`
   - **Subject:** `Nouvelle demande de Test Ride — Bajaj Morocco`
   - **Content** (paste this — the double fields cover both forms; the empty one just shows blank):
     ```
     Modèle:          {{model}}
     Nom:             {{name}} {{surname}}
     Téléphone:       {{telephone}}{{phone}}
     Email:           {{email}}
     Ville:           {{city}}
     Concessionnaire: {{dealership}}{{dealer}}
     Délai d'achat:   {{timeline}}
     WhatsApp:        {{whatsapp}}
     ```
   - Save and copy the **Template ID** (looks like `template_xxxxxxx`).
4. **Account → General / API Keys** → copy your **Public Key** (looks like `XXXXXXXXXXXXXXXX`).

### 2. Put your 3 IDs into the site
Replace the placeholders everywhere (from the repo root):
```bash
# Linux
grep -rl 'YOUR_PUBLIC_KEY\|YOUR_SERVICE_ID\|YOUR_TEMPLATE_ID' . --include=*.html | xargs sed -i \
  -e 's/YOUR_PUBLIC_KEY/XXXXXXXXXXXXXXXX/g' \
  -e 's/YOUR_SERVICE_ID/service_xxxxxxx/g' \
  -e 's/YOUR_TEMPLATE_ID/template_xxxxxxx/g'
# macOS: use  sed -i ''  instead of  sed -i
```
(substitute your real values), then commit and push.

### How it works
- EmailJS SDK is loaded in each page's `<head>` and initialised with your Public Key.
- The **test-ride form** calls `emailjs.sendForm(SERVICE, TEMPLATE, form)` — it sends every
  named field automatically.
- The **enquiry panel** calls `emailjs.send(SERVICE, TEMPLATE, params)` with its fields.
- Both show the existing on-page "Merci !" success message and never redirect away.

## Notes
- Harmless leftover WordPress `<head>` discovery tags (`/feed/`, `/wp-json/`, `/xmlrpc.php`)
  remain but are never fetched by browsers and have no visual effect. Safe to delete.
