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
- A few well-known libraries stay on their CDNs (Google Fonts, Font Awesome, Swiper) and the
  Spain hero video stays on its original host — these load fine on any domain.

## ⚠️ REQUIRED: Set up the contact forms (Formspree)

There are **two** lead-capture forms and both were wired to Formspree. Until you paste your
real Formspree ID, submissions will not be delivered.

Both forms currently point to the placeholder `https://formspree.io/f/YOUR_FORM_ID`.

### 1. Create a free Formspree account
1. Go to <https://formspree.io> and click **Sign up** (free "Free" plan = 50 submissions/month).
2. Verify your email.
3. Click **+ New Form**.
4. Set **Send emails to:** `z.elhaimri@gmail.com` and give it a name (e.g. "Bajaj Test Ride").
5. Formspree shows an endpoint like `https://formspree.io/f/abcdwxyz` — copy the **form ID**
   (the `abcdwxyz` part after `/f/`).
6. Send one test submission from the site and click the confirmation link Formspree emails to
   `z.elhaimri@gmail.com` (Formspree requires confirming the destination address once).

### 2. Put your form ID into the site
Replace every `YOUR_FORM_ID` with your real ID (10 occurrences: the pop-up enquiry panel on all
9 pages + the "Schedule your Test Ride" form on `/test-ride/`). From the repo root:

```bash
# macOS
grep -rl 'YOUR_FORM_ID' . --include=*.html | xargs sed -i '' 's#formspree.io/f/YOUR_FORM_ID#formspree.io/f/abcdwxyz#g'
# Linux
grep -rl 'YOUR_FORM_ID' . --include=*.html | xargs sed -i 's#formspree.io/f/YOUR_FORM_ID#formspree.io/f/abcdwxyz#g'
```
(replace `abcdwxyz` with your real ID), then commit and push.

### How the forms behave
- **Enquiry pop-up panel** (main "Schedule your Test Ride" button, on every page): submits by
  AJAX to Formspree and shows the existing on-page "Merci !" success message. Fields: name,
  phone, city, dealer, purchase timeline, WhatsApp opt-in.
- **"Schedule your Test Ride" form** on `/test-ride/`: submits by AJAX to Formspree and shows a
  success message in place. Fields: model, name, surname, telephone, email, dealership.

Both email to whatever address you set on the Formspree form.

## Notes
- Harmless leftover WordPress `<head>` discovery tags (`/feed/`, `/wp-json/`, `/xmlrpc.php`)
  remain but are never fetched by browsers and have no visual effect. Safe to delete.
