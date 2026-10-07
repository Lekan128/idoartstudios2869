import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { EventBookingData, EventPlan } from "../../types";
import { cardRates, formatRate, shortPlanName } from "../../lib/event";
import PeopleIcon from "./PeopleIcon";

interface Props {
  data: EventBookingData;
  plan: EventPlan;
  /** Photo to open on. */
  start: number;
  onClose: () => void;
  /** Picks this plan straight from the details. */
  onChoose: () => void;
}

function Arrow({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? "Next photo" : "Previous photo"}
      className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-0 md:flex ${
        dir === 1 ? "right-4" : "left-4"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === 1 ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
      </svg>
    </button>
  );
}

/**
 * Everything about one experience in one place: the example photos (swipe on
 * phones, arrows and keyboard on desktop) beside the description, rates, what's
 * included and how many guests it serves — ending in the decision it supports,
 * a button to choose this plan. Photos fill the left on wide screens; on phones
 * they sit on top and the details rise beneath them like a sheet, with the
 * choose button pinned at the bottom. Escape or the ✕ closes it.
 */
export default function PlanDetails({ data, plan, start, onClose, onChoose }: Props) {
  const images = plan.images ?? [];
  const count = images.length;
  const [index, setIndex] = useState(start);
  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Open on the photo that was showing on the card, without animating there.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = start * track.clientWidth;
  }, [start]);

  // Lock the page behind, focus the close button, and hand focus back on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      // Without preventScroll the browser scrolls the card back into view, which
      // would cancel the scroll to the form after "Choose".
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  const go = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(count - 1, i));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    track.scrollTo({ left: target * track.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
    else if (e.key === "Tab") {
      // Keep keyboard focus inside the dialog while it's open.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-details-title"
      onKeyDown={onKeyDown}
      className="lightbox-enter fixed inset-0 z-[80] flex flex-col bg-neutral-950/95 backdrop-blur-md md:flex-row"
    >
      {/* Photos */}
      <div className="relative h-[42vh] shrink-0 md:h-auto md:min-w-0 md:flex-1">
        {count > 0 ? (
          <>
            <Arrow dir={-1} disabled={index <= 0} onClick={() => go(index - 1)} />
            <div
              ref={trackRef}
              onScroll={(e) => {
                const track = e.currentTarget;
                setIndex(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
              }}
              className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((photo, i) => (
                <figure
                  key={i}
                  // A tap on the dark area beside the photo closes, like most photo viewers.
                  onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                  }}
                  className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4 pb-4 pt-16 md:px-20 md:py-10"
                >
                  <img src={photo.image} alt={photo.alt || plan.name} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
                </figure>
              ))}
            </div>
            <Arrow dir={1} disabled={index >= count - 1} onClick={() => go(index + 1)} />

            {count > 1 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-1.5 md:bottom-4" aria-hidden="true">
                {images.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
                ))}
              </div>
            )}
            {count > 1 && (
              <p className="sr-only" aria-live="polite">
                Photo {index + 1} of {count}
              </p>
            )}
          </>
        ) : null}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30 md:left-4 md:right-auto md:top-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl bg-white md:w-[26rem] md:flex-none md:rounded-none lg:w-[30rem]">
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-6 sm:px-8 md:pt-10">
          {plan.badge && (
            <span className="inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-pink-700">
              {plan.badge}
            </span>
          )}
          <h2 id="plan-details-title" className="mt-2 text-2xl font-extrabold leading-tight text-neutral-900 sm:text-3xl">
            {plan.name}
          </h2>
          {plan.tagline && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-pink-600">{plan.tagline}</p>
          )}
          {plan.description && <p className="mt-4 text-neutral-700">{plan.description}</p>}

          <dl className="mt-5 divide-y divide-pink-100 border-y border-pink-100 text-sm">
            {cardRates(plan).map((rate, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="text-neutral-600">
                  {rate.label}
                  {rate.note && <span className="block text-xs text-neutral-500">{rate.note}</span>}
                </dt>
                <dd className="whitespace-nowrap text-base font-extrabold text-neutral-900">{formatRate(data, rate.price)}</dd>
              </div>
            ))}
          </dl>

          {plan.capacity && (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <PeopleIcon className="shrink-0 text-pink-600" />
              {plan.capacity}
            </p>
          )}

          {plan.features?.length > 0 && (
            <section className="mt-6">
              <h3 className="text-base font-extrabold text-neutral-900">What's included</h3>
              {plan.includesIntro && <p className="mt-1 text-sm font-semibold text-neutral-700">{plan.includesIntro}</p>}
              <ul className="mt-3 space-y-2.5 text-sm text-neutral-700">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[10px] font-bold text-pink-700">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="border-t border-pink-100 bg-white px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onChoose}
            className="w-full rounded-full bg-pink-600 px-6 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-pink-700"
          >
            Choose {shortPlanName(plan)}
          </button>
        </div>
      </div>
    </div>
  );
}
