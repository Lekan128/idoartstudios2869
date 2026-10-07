import { useEffect, useState } from "react";
import pageData from "../data/spot-on-caricature.json";
import bookingData from "../data/event-booking.json";
import siteData from "../data/site.json";
import ReactionVideo from "../components/home/ReactionVideo";
import PlanCard from "../components/event/PlanCard";
import EventInquiryForm from "../components/event/EventInquiryForm";
import PlanDetails from "../components/event/PlanDetails";
import type { EventBookingData, ServicePageData, SiteData } from "../types";
import { track } from "../lib/analytics";
import { scrollToId } from "../lib/scroll";

const page = pageData as ServicePageData;
const booking = bookingData as EventBookingData;
const site = siteData as SiteData;

/**
 * The event page is also the booking page: a short heading, the experiences
 * straight away, then one form. Choosing an experience carries it into the form
 * and brings the form into view; the reassurance follows for anyone still deciding.
 */
export default function SpotOnCaricature() {
  const [plan, setPlan] = useState("");
  // The plan whose details are open, and which photo to show first.
  const [viewing, setViewing] = useState<{ planId: string; start: number } | null>(null);
  const viewingPlan = viewing ? booking.plans.find((p) => p.id === viewing.planId) : undefined;

  useEffect(() => {
    document.title = page.seoTitle;
  }, []);

  const choosePlan = (id: string) => {
    setPlan(id);
    track("event_plan_selected", { plan: id });
    scrollToId("event-booking", 80);
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <header className="max-w-3xl">
          <p className="text-xs font-bold tracking-widest text-pink-600">{site.brandName.toUpperCase()}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl lg:text-5xl">{page.heading}</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-pink-600 sm:text-base">{page.intro}</p>
        </header>
      </div>

      <section id="plans" aria-labelledby="plans-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-10 sm:px-6 sm:pt-12">
        <h2 id="plans-title" className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
          {booking.plansTitle}
        </h2>
        {booking.plansHint && <p className="mt-1 text-sm text-neutral-600">{booking.plansHint}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {booking.plans.map((p, i) => (
            <PlanCard
              key={p.id}
              data={booking}
              plan={p}
              selected={plan === p.id}
              // Each card turns ~1s after the one before it, so the row ripples rather than flips at once.
              stagger={i * 1000}
              photosPaused={viewing !== null}
              onChoose={() => choosePlan(p.id)}
              onOpenDetails={(start) => {
                setViewing({ planId: p.id, start });
                track("event_plan_details_opened", { plan: p.id });
              }}
            />
          ))}
        </div>
      </section>

      <section id="book" className="mt-12 scroll-mt-20 bg-pink-50/60 py-10 sm:mt-16 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div id="event-booking" className="scroll-mt-20">
            <EventInquiryForm data={booking} site={site} plan={plan} onPlanChange={setPlan} />
          </div>

          {booking.nextSteps?.length > 0 && (
            <aside>
              <h2 className="text-lg font-extrabold text-neutral-900">{booking.nextStepsTitle}</h2>
              <ol className="mt-4 space-y-4 border-l-2 border-pink-200 pl-4">
                {booking.nextSteps.map((step, i) => (
                  <li key={i}>
                    <p className="font-bold text-neutral-900">{step.title}</p>
                    <p className="mt-0.5 text-sm text-neutral-600">{step.body}</p>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </section>

      {page.sections?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
          <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">{booking.whyTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {page.sections.map((section, i) => (
              <div key={i} className="rounded-2xl bg-pink-50 p-6">
                <h3 className="text-lg font-bold text-neutral-900">{section.title}</h3>
                <p className="mt-2 text-neutral-700">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <ReactionVideo />

      {viewingPlan && viewing && (
        <PlanDetails
          data={booking}
          plan={viewingPlan}
          start={viewing.start}
          onClose={() => setViewing(null)}
          onChoose={() => {
            setViewing(null);
            // After the details view has handed focus back and unlocked the page.
            requestAnimationFrame(() => choosePlan(viewingPlan.id));
          }}
        />
      )}
    </>
  );
}
