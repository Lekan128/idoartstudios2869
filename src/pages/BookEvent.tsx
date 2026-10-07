import { useEffect } from "react";
import pageData from "../data/book-event.json";
import siteData from "../data/site.json";
import type { BookEventData, SiteData } from "../types";
import EventInquiryForm from "../components/event/EventInquiryForm";

const page = pageData as BookEventData;
const site = siteData as SiteData;

export default function BookEvent() {
  useEffect(() => {
    document.title = page.seoTitle;
  }, []);

  return (
    <div className="bg-pink-50/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-pink-600">{page.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl lg:text-5xl">{page.heading}</h1>
          <p className="mt-3 text-lg text-neutral-700">{page.intro}</p>
        </header>

        {/* Form first on phones: it's the reason for the visit. The reassurance sits
            beside it on wide screens and after it on narrow ones. */}
        <div className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <EventInquiryForm data={page} site={site} />

          <aside className="space-y-10">
            {page.facts?.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold text-neutral-900">{page.factsTitle}</h2>
                <dl className="mt-4 space-y-4">
                  {page.facts.map((fact, i) => (
                    <div key={i}>
                      <dt className="font-bold text-neutral-900">{fact.title}</dt>
                      <dd className="mt-0.5 text-sm text-neutral-600">{fact.body}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {page.nextSteps?.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold text-neutral-900">{page.nextStepsTitle}</h2>
                <ol className="mt-4 space-y-4 border-l-2 border-pink-200 pl-4">
                  {page.nextSteps.map((step, i) => (
                    <li key={i}>
                      <p className="font-bold text-neutral-900">{step.title}</p>
                      <p className="mt-0.5 text-sm text-neutral-600">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
