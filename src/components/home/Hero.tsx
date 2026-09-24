import { Link } from "react-router-dom";
import homeData from "../../data/home.json";
import siteData from "../../data/site.json";
import type { HomeData, SiteData } from "../../types";

const home = homeData as HomeData;
const site = siteData as SiteData;

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-pink-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm font-bold tracking-wide text-pink-600">{home.eyebrow}</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-[1.05] text-neutral-900 sm:text-6xl lg:text-7xl">
            {home.headlinePlain} <span className="text-pink-600">{home.headlineAccent}</span>
          </h1>
          <p className="mt-5 max-w-md text-lg font-medium text-neutral-700 sm:text-xl">{home.subheadline}</p>

          <a
            href={site.bookEventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-600 px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-pink-700"
          >
            {site.bookEventLabel}
            <span aria-hidden="true">→</span>
          </a>

          <div>
            <Link
              to="/spot-on-caricature/"
              className="mt-4 inline-block text-sm font-semibold text-neutral-600 underline decoration-pink-300 underline-offset-4 hover:text-pink-600"
            >
              Learn about our spot-on caricature service →
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <div className="aspect-square overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
            <img
              src={home.heroImage}
              alt={home.heroCaption}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="absolute -right-1 top-4 max-w-[9rem] rotate-3 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-800 shadow sm:-right-6">
            {home.heroCaption}
          </p>
        </div>
      </div>
    </section>
  );
}
