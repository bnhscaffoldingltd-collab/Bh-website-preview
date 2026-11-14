# B&H Scaffolding Ltd: website

A single-page static website with one server function for the quote form.
No build step.

```
index.html              the page
styles.css, site.js     design and behaviour (slideshow, menu, photo viewer, form)
img/                    optimised photos (hero crops for desktop and phone, project photos, logo)
functions/api/enquiry.js  sends the quote form to ops@bhscaffolding.co.uk (Cloudflare Pages Function)
_headers                caching rules for Cloudflare Pages
tools/make-images.py    rebuilds the hero crops from the original photos (blurs people and plates)
```

## Current status

- **Not live.** bhscaffolding.co.uk still serves the previous site.
- **Quote form:** the interface is finished, but online sending is switched off
  (`data-live="false"` on the form). Visitors who submit are told clearly that it has not
  been sent and are given a pre-filled email to send instead. Nothing pretends to succeed.

## How the current live site is hosted (as found)

- The domain is proxied by Cloudflare.
- The live site's response headers show it is a **vinext** app (Cloudflare's Next.js-on-Vite
  framework), so it is most likely deployed as a Cloudflare Worker.
- Its source code is **not** in this repository (which was empty) and was not found in the
  other repositories available to us. Whoever built the current site has the source and the
  Cloudflare account access.

## Going live (only after the preview is approved)

Recommended: Cloudflare Pages, in the same Cloudflare account that holds bhscaffolding.co.uk.

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → this repository.
2. Build command: *(none)*. Build output directory: `/`.
3. Check the `*.pages.dev` preview address.
4. Only then, move the custom domain `bhscaffolding.co.uk` from the existing Worker to the Pages
   project (Custom domains tab). This replaces the old site, so do it once the preview is approved.

## Switching on the quote form

The form sends through [Resend](https://resend.com) (free tier: 3,000 emails a month).

1. Create a Resend account and verify `bhscaffolding.co.uk` as a sending domain
   (adds DNS records in Cloudflare; does not affect existing email).
2. In the Pages project → Settings → Variables and Secrets, add:
   - `RESEND_API_KEY` (secret)
   - `ENQUIRY_FROM` = `B&H Website <website@bhscaffolding.co.uk>`
   - `ENQUIRY_TO` = `ops@bhscaffolding.co.uk`
3. In `index.html`, change `data-live="false"` to `data-live="true"` on the form.
4. Send a test enquiry and confirm it arrives in ops@bhscaffolding.co.uk.

Enquiries arrive with the customer's email as the reply-to address, plus any attached photos
(up to 5 files, 10 MB in total). A hidden spam trap discards bot submissions.
