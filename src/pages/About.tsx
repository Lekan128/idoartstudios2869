import { useEffect } from "react";
import aboutData from "../data/about.json";
import siteData from "../data/site.json";
import type { AboutData, SiteData } from "../types";
import BookEventLink from "../components/layout/BookEventLink";

const about = aboutData as AboutData;
const site = siteData as SiteData;

/**
 * Highlights are written as "Short Heading  Body text…" (a double space after
 * the heading). Pull that heading out so it can be set in bold; anything else
 * is shown as one paragraph.
 */
function splitHeading(text: string): { heading: string; body: string } {
  const match = text.match(/^(.{3,60}?)\s{2,}([\s\S]+)$/);
  return match ? { heading: match[1].trim(), body: match[2].replace(/\s{2,}/g, " ").trim() } : { heading: "", body: text };
}

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
        <p className="mt-2 max-w-2xl text-sm font-semibold text-pink-600 sm:text-base">{about.intro}</p>

        <div className="mt-6 max-w-2xl space-y-4 text-neutral-700">
          {about.bodyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* The highlights are useful to search engines but too long to show by
            default, so they sit in a closed toggle: still part of the page (Google
            indexes content in expandable sections in full), open to anyone who
            wants it. Text hidden from people altogether would count as hidden
            text under Google's spam policies. */}
        {about.highlights?.length > 0 && (
          <details className="group mt-8 max-w-2xl rounded-2xl bg-pink-50/70 ring-1 ring-pink-100">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-bold text-neutral-800 hover:bg-pink-50 [&::-webkit-details-marker]:hidden">
              {about.highlightsTitle || `More about ${site.brandName}`}
              <span aria-hidden="true" className="text-lg leading-none text-pink-600 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="space-y-4 px-5 pb-5 text-sm leading-relaxed text-neutral-700">
              {about.highlights.map((h, i) => {
                const { heading, body } = splitHeading(h);
                return (
                  <p key={i}>
                    {heading && <strong className="block text-neutral-900">{heading}</strong>}
                    {body}
                  </p>
                );
              })}
            </div>
          </details>
        )}

        <BookEventLink
          placement="about"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-600 px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-pink-700"
        >
          {site.bookEventLabel}
          <span aria-hidden="true">→</span>
        </BookEventLink>
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
