import { Link } from "react-router-dom";
import homeData from "../../data/home.json";
import siteData from "../../data/site.json";
import type { HomeData, SiteData } from "../../types";
import BookEventLink from "../layout/BookEventLink";
import { track } from "../../lib/analytics";

const home = homeData as HomeData;
const site = siteData as SiteData;

export default function Hero() {
  const bg = home.heroBackgroundImage;

  return (
    <section id="top" className={`relative overflow-hidden ${bg ? "bg-neutral-900" : "bg-pink-50"}`}>
      {bg && (
        <>
          <img
            src={bg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/65" />
        </>
      )}
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:py-20">
        <div>
          <p className={`text-sm font-bold tracking-wide ${bg ? "text-pink-400" : "text-pink-600"}`}>{home.eyebrow}</p>
          <h1
            className={`mt-3 text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl ${bg ? "text-white" : "text-neutral-900"}`}
          >
            {home.headlinePlain} <span className={bg ? "text-pink-500" : "text-pink-600"}>{home.headlineAccent}</span>
          </h1>
          <p className={`mt-5 max-w-md text-lg font-medium sm:text-xl ${bg ? "text-neutral-200" : "text-neutral-700"}`}>{home.subheadline}</p>

          {/* Two doors, one primary: events bring in the most, so they get the filled
              button; ordering a drawing online is the outlined second choice. */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookEventLink
              placement="hero"
              className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-pink-700"
            >
              {site.bookEventLabel}
              <span aria-hidden="true">→</span>
            </BookEventLink>
            <Link
              to="/styles/"
              onClick={() => track("home_order_online_clicked")}
              className={`inline-flex items-center rounded-full px-6 py-3 text-base font-semibold ring-2 ring-inset transition-colors ${
                bg ? "text-white ring-white/70 hover:bg-white/10" : "text-pink-700 ring-pink-300 hover:bg-pink-100"
              }`}
            >
              {home.orderOnlineLabel || "Order a caricature online"}
            </Link>
          </div>

          <div>
            <Link
              to="/spot-on-caricature/"
              className={`mt-4 inline-block text-sm font-semibold underline decoration-pink-300 underline-offset-4 ${
                bg ? "text-neutral-200 hover:text-pink-300" : "text-neutral-600 hover:text-pink-600"
              }`}
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
