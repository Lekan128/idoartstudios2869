import { useEffect } from "react";
import pageData from "../data/spot-on-caricature.json";
import siteData from "../data/site.json";
import type { ServicePageData, SiteData } from "../types";

const page = pageData as ServicePageData;
const site = siteData as SiteData;

export default function SpotOnCaricature() {
  useEffect(() => {
    document.title = page.seoTitle;
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-bold tracking-widest text-pink-600">{site.brandName.toUpperCase()}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl lg:text-5xl">{page.heading}</h1>
        <p className="mt-3 text-lg font-semibold text-pink-600">{page.intro}</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {page.sections.map((section, i) => (
          <div key={i} className="rounded-2xl bg-pink-50 p-6">
            <h2 className="text-lg font-bold text-neutral-900">{section.title}</h2>
            <p className="mt-2 text-neutral-700">{section.body}</p>
          </div>
        ))}
      </div>

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
