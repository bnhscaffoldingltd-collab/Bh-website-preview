# B&H Scaffolding — website

A static website: no build step. Upload the whole folder to any web host
(for example Cloudflare Pages: connect this repository, leave the build command
empty, and set the output directory to `/`).

- `index.html` — homepage
- `work.html` — the full "Our Work" gallery
- `photos.js` — **the gallery photos and their labels; edit this to add photos**
- `site.js` — gallery, filters and photo viewer
- `styles.css` — styling (B&H red `#c91d2a`)
- `images/jobs/` — job photos (web-sized; plates, house numbers and people blurred)

## Adding photos
1. Put them in `images/jobs/` named like `my-job-1.webp`, `my-job-2.webp`.
2. Add one line to `photos.js`, e.g. `add("residential", "Victorian terrace", "my-job", 2);`
