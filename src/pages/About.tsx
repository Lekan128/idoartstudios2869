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
    <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-12 md:gap-12 sm:px-6 sm:py-16 md:grid-cols-[1fr_16rem] lg:grid-cols-[1fr_24rem] lg:gap-16">
      <div>
        <p className="text-xs font-bold tracking-widest text-pink-600">{site.brandName.toUpperCase()}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl lg:text-5xl">{about.heading}</h1>
        <p className="mt-3 text-lg font-semibold text-pink-600">{about.intro}</p>

        <div className="mt-6 max-w-2xl space-y-4 text-neutral-700">
          {about.bodyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
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
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-600 px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-pink-700"
        >
          {site.bookEventLabel}
          <span aria-hidden="true">→</span>
        </a>
      </div>

      {about.artistImage && (
        <div className="order-first w-28 md:order-none md:w-full">
          <div className="aspect-square overflow-hidden rounded-full border-4 border-white bg-pink-50 shadow-xl ring-1 ring-pink-100">
            <img src={about.artistImage} alt={about.heading} className="h-full w-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
