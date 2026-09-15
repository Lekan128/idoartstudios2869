// Runs after `vite build` (see package.json "postbuild"). This is a client-rendered
// SPA, so without this step every route would serve the *same* <title>/meta tags
// (the homepage's) baked into dist/index.html — fine for the homepage, but wrong for
// a page whose entire SEO value is a distinct, keyword-specific <title>/description.
// Search engines that don't execute JS (and social-share crawlers, which never do)
// only ever see this static HTML.
//
// This does NOT prerender the page body — React still renders the real content
// client-side. It only swaps the <head> so each route has its own crawlable meta,
// which is the part a plain SPA build can't give you per-route.
//
// Netlify note: this relies on real files taking precedence over the SPA catch-all
// redirect in netlify.toml (Netlify's default behavior — an existing file at the
// requested path is served before any redirect rule runs).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://idoartstudios.com.ng";

function readJson(rel) {
  return JSON.parse(readFileSync(path.join(ROOT, rel), "utf8"));
}

const about = readJson("src/data/about.json");
const spotOn = readJson("src/data/spot-on-caricature.json");

// Every route here matches an old WordPress URL exactly — these are the pages
// confirmed (via live search results) to be actively ranking, so they need their
// own real meta with zero redirect required at cutover.
const ROUTES = [
  { slug: "about-i-do-art-studios", title: about.seoTitle, description: about.seoDescription },
  { slug: "spot-on-caricature", title: spotOn.seoTitle, description: spotOn.seoDescription },
];

const template = readFileSync(path.join(DIST, "index.html"), "utf8");

function replaceHead(html, { title, description, url }) {
  let out = html;
  out = out.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/>/s,
    `<meta name="description" content="${description}" />`,
  );
  out = out.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`);
  out = out.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
  out = out.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/>/s,
    `<meta property="og:description" content="${description}" />`,
  );
  out = out.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`);
  out = out.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`);
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/>/s,
    `<meta name="twitter:description" content="${description}" />`,
  );
  return out;
}

for (const route of ROUTES) {
  const url = `${SITE_URL}/${route.slug}/`;
  const html = replaceHead(template, { title: route.title, description: route.description, url });
  const dir = path.join(DIST, route.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), html);
  console.log(`Generated static SEO head for: /${route.slug}/`);
}

// Sitemap — lists every real, indexable URL explicitly so Google doesn't have to
// discover them purely through internal links or a (possibly stale) old sitemap.
const urls = ["/", ...ROUTES.map((r) => `/${r.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}
</urlset>
`;
writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
console.log(`Generated sitemap.xml with ${urls.length} URLs`);
