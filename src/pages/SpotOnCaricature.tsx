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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold tracking-widest text-pink-600">{site.brandName.toUpperCase()}</p>
      <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{page.heading}</h1>
      <p className="mt-3 text-lg font-semibold text-pink-600">{page.intro}</p>

      <div className="mt-8 space-y-4">
        {page.sections.map((section, i) => (
          <div key={i} className="rounded-xl bg-pink-50 p-5">
            <h2 className="text-base font-bold text-neutral-900">{section.title}</h2>
            <p className="mt-1 text-neutral-700">{section.body}</p>
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
