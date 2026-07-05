# Kreassi Team — Company Website

Single-page marketing site for [Kreassi Team](https://kreassiteam.com), built with **Vue 3 + Vite + Tailwind CSS**, bilingual (English / Indonesian) via vue-i18n.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Project structure

```
index.html                 SEO meta tags, Open Graph, JSON-LD structured data
public/                    Static files served as-is (favicon, robots.txt, sitemap.xml)
src/
  App.vue                  Page layout: ordered list of <section> blocks
  main.js                  App bootstrap
  style.css                Tailwind directives + global CSS (scroll reveal, logo hover)
  config/site.js           ★ Contact info, social links, Google Sheet URL, site URL
  i18n/messages.js         ★ ALL page copy, in English and Indonesian
  data/testimonials.js     Fallback testimonials (used if the Google Sheet is offline)
  components/              One component per page section
    Services/              The 10 service slides + shared slide scaffolding
  composables/             Reusable logic (scroll direction, active nav section, testimonials)
  directives/reveal.js     v-reveal scroll-into-view animation
  utils/                   CSV parser, partner logo resolver, asset glob helpers
  assets/                  Images, videos, logos (managed by the design team)
```

★ = the files you'll edit most often.

## How to make common changes

- **Change any text on the page** → `src/i18n/messages.js` (edit both `en` and `id`).
- **Change phone numbers / email / socials** → `src/config/site.js`.
- **Add a partner logo** → drop a PNG into `src/assets/Logos/`. The filename is used
  as the partner name. To control its position, add the name to `preferredOrder`
  in `src/components/Partners.vue`.
- **Testimonials** → live in the published Google Sheet (URL in `src/config/site.js`,
  columns: `id, customer_name, comment, rating, company_name, logo_file`).
  The site falls back to `src/data/testimonials.js` if the sheet is unreachable.
- **Add/replace service portfolio images** → the folders under
  `src/assets/Images/Services/<Service Name>/`, numbered `1.png`, `2.png`, …
- **Section order** → `src/App.vue`.

## Deployment

The site deploys automatically: **push to `main` → Netlify builds and publishes
to https://kreassiteam.com**.

- `netlify.toml` defines the build (command, `dist/` publish dir, Node 22) and
  the SPA redirect. `public/_redirects` is a duplicate of the redirect rule.
- `.github/workflows/ci.yml` runs a build check on every push/PR — a red ❌ on
  GitHub means Netlify's build of that commit will fail too.
- To verify a deploy: check the Netlify dashboard (Deploys tab), or hard-refresh
  the site and confirm the page title shows the newest version.
- SEO: update the canonical URL in `index.html`, `public/robots.txt`, and
  `public/sitemap.xml` if the domain ever changes.
