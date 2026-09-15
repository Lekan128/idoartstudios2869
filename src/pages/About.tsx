import { useEffect } from "react";
import aboutData from "../data/about.json";
import siteData from "../data/site.json";
import type { AboutData, SiteData } from "../types";

const about = aboutData as AboutData;
const site = siteData as SiteData;

export default function About() {
  // Client-side title update for in-app navigation. The crawler-facing
  // <title>/meta for this route are baked into the static HTML at build
  // time by scripts/generate-static-pages.mjs — this is a UX nicety on top
  // of that, not the SEO mechanism itself.
  useEffect(() => {
    document.title = about.seoTitle;
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold tracking-widest text-pink-600">{site.brandName.toUpperCase()}</p>
      <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{about.heading}</h1>
      <p className="mt-3 text-lg font-semibold text-pink-600">{about.intro}</p>

      <div className="mt-8 space-y-4 text-neutral-700">
        {about.bodyParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {about.highlights.map((h, i) => (
          <li key={i} className="rounded-xl bg-pink-50 p-4 text-sm font-semibold text-neutral-800">
            {h}
          </li>
        ))}
      </ul>

      <a
        href={site.bookEventUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-pink-600 px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-pink-700"
      >
        {site.bookEventLabel}
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
