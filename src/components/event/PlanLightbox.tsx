import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { EventBookingData, EventPlan } from "../../types";
import { cardRates, formatRate, shortPlanName } from "../../lib/event";

interface Props {
  data: EventBookingData;
  plan: EventPlan;
  /** Photo to open on. */
  start: number;
  onClose: () => void;
  /** Picks this plan straight from the viewer. */
  onChoose: () => void;
}

function Arrow({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? "Next photo" : "Previous photo"}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-0 sm:flex ${
        dir === 1 ? "right-4" : "left-4"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === 1 ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
      </svg>
    </button>
  );
}

/**
 * Full-screen viewer for a plan's example photos. Swipe on phones (a native
 * scroll-snap row), arrows and keyboard on desktop. It ends in the decision it
 * supports: a button to choose this plan, so looking at examples leads straight
 * to booking. Escape, the ✕ or a tap beside the photo closes it.
 */
export default function PlanLightbox({ data, plan, start, onClose, onChoose }: Props) {
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
      // would cancel the scroll to the form after "Choose" in the viewer.
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
      // Keep keyboard focus inside the viewer while it's open.
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

  const rates = cardRates(plan)
    .map((r) => `${r.label} ${formatRate(data, r.price)}`)
    .join(" · ");

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${plan.name} — example photos`}
      onKeyDown={onKeyDown}
      className="lightbox-enter fixed inset-0 z-[80] flex flex-col bg-neutral-950/95 backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-4 px-4 pb-2 pt-4 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-white sm:text-xl">{plan.name}</p>
          {count > 1 && (
            <p className="text-sm text-white/60" aria-live="polite">
              Photo {index + 1} of {count}
            </p>
          )}
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photos"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
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
              className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4 py-2 sm:px-20"
            >
              <img src={photo.image} alt={photo.alt || plan.name} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
            </figure>
          ))}
        </div>

        <Arrow dir={1} disabled={index >= count - 1} onClick={() => go(index + 1)} />
      </div>

      <div className="px-4 pb-5 pt-3 sm:px-6">
        {count > 1 && (
          <div className="mb-3 flex justify-center gap-1.5" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        )}
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          {rates && <p className="text-sm text-white/70">{rates}</p>}
          <button
            type="button"
            onClick={onChoose}
            className="w-full shrink-0 rounded-full bg-pink-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-pink-700 sm:w-auto"
          >
            Choose {shortPlanName(plan)}
          </button>
        </div>
      </div>
    </div>
  );
}
