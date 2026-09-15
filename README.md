# I Do Art Studios — website

React + Vite + TypeScript + Tailwind CSS, content editable via Decap CMS.

## Run locally

Requires Node >= 22.12 (see `.nvmrc`).

```bash
npm install
npm run dev
```

## Edit content

All page copy, images, and links live in `src/data/*.json` and are editable
through the CMS at `/admin` once this repo is connected to Netlify Identity +
Git Gateway (Site settings → Identity, and Site settings → Git Gateway in the
Netlify dashboard). Editing the JSON files directly also works and is
reflected immediately in the running site.

- `src/data/site.json` — brand name, logo, nav, Book an Event link, contact info
- `src/data/home.json` — hero headline/tagline, section headings
- `src/data/gallery.json` — gallery slideshow photos
- `src/data/styles.json` — the three caricature style/package cards

## Blog

`/blog` and `/blog/:slug` are scaffolded routes only. The actual blog (posts
stored in MongoDB, served through Netlify Functions) is a separate future
build — see project notes for the planned architecture.

## Deploying / domain cutover

See the comments in `netlify.toml` before pointing DNS at this site — the
old WordPress URLs need explicit 301 redirects added there first to avoid
losing existing Google rankings.
