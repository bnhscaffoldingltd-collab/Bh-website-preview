# B&H Scaffolding — website

A static website: no build step. Upload the whole folder to any web host
(for example Cloudflare Pages: connect this repository, leave the build command
empty, and set the output directory to `/`).

- `index.html` — homepage
- `work.html` — the full "Our Work" gallery
- `jobs.js` — **the list of jobs; edit this to add or change projects**
- `site.js` — gallery, filters and photo viewer
- `styles.css` — styling (B&H red `#c91d2a`)
- `images/jobs/` — job photos (web-sized; plates, house numbers and people blurred)

## Adding a job
1. Put the photos in `images/jobs/` named like `my-job-1.webp`, `my-job-2.webp`.
2. Copy an entry in `jobs.js`, fill in the title, category, summary and
   `photos: p("my-job", 2)` (the number is how many photos).
3. Add a town in `location` if you're happy to show it.
