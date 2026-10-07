import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

interface Props {
  images: { image: string; alt: string }[];
  planName: string;
  badge: string;
  /** Delay before this card starts rotating, so neighbouring cards don't all change at once. */
  stagger: number;
  /** Held still while the details view is open. */
  paused: boolean;
  onOpen: (index: number) => void;
}

/** How long each photo rests before the next slides in. */
const ROTATE_MS = 4000;
/** Matches the slide transition below. */
const SLIDE_MS = 700;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
}

/**
 * The example photos on a plan card. They slide forward every few seconds —
 * always forward: a copy of the first photo sits at the end, and once it has
 * slid in the row quietly resets to the real first one. Tapping opens the
 * details view at the photo on show. Rotation holds while a mouse is over
 * the card, while it's off screen, in a background tab, and never runs with
 * reduced motion; the dots still let anyone step through by hand.
 */
export default function PlanPhotos({ images, planName, badge, stagger, paused, onOpen }: Props) {
  const count = images.length;
  const looping = count > 1;
  const slides = looping ? [...images, images[0]] : images;

  const [pos, setPos] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [reducedMotion] = useState(prefersReducedMotion);
  const rootRef = useRef<HTMLDivElement>(null);
  const hold = useRef({ hover: false, offscreen: true });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      hold.current.offscreen = false;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        hold.current.offscreen = !entry.isIntersecting;
      },
      { threshold: 0.4 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!looping || reducedMotion || paused) return;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        const h = hold.current;
        if (h.hover || h.offscreen || document.hidden) return;
        setAnimate(true);
        // Never step past the copy at the end; the reset below brings it back to 0.
        setPos((p) => (p >= count ? p : p + 1));
      }, ROTATE_MS);
    }, stagger);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [looping, reducedMotion, paused, stagger, count]);

  // Once the copy of the first photo has slid in, jump to the real one without animating.
  useEffect(() => {
    if (pos !== count || !looping) return;
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setPos(0);
    }, SLIDE_MS + 50);
    return () => window.clearTimeout(timer);
  }, [pos, count, looping]);

  // Turn the slide animation back on a frame after that silent jump.
  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const current = looping ? pos % count : 0;

  // Hover pause is for mouse users only: a tap on a phone would otherwise leave a
  // sticky "hover" that freezes the photos until they tap somewhere else.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === "mouse") hold.current.hover = true;
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") hold.current.hover = false;
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="relative w-28 shrink-0 self-stretch overflow-hidden bg-pink-50 sm:aspect-[4/5] sm:w-full"
    >
      <button
        type="button"
        onClick={() => onOpen(current)}
        aria-label={count > 1 ? `See ${count} example photos of the ${planName}` : `See the ${planName} photo`}
        className="group absolute inset-0 block h-full w-full cursor-zoom-in"
      >
        <span
          className={`flex h-full ${animate ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
          style={{ transform: `translateX(-${pos * 100}%)` }}
        >
          {slides.map((photo, i) => (
            <img
              key={i}
              src={photo.image}
              // The button's label describes the photos; the full descriptions are in the viewer.
              alt=""
              className="h-full w-full shrink-0 object-cover object-[50%_30%] transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ))}
        </span>
      </button>

      {badge && (
        <span className="pointer-events-none absolute left-0 top-3 hidden rounded-r-full bg-pink-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow sm:block">
          {badge}
        </span>
      )}

      {/* Says "there's more to see, and you can open it". */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:px-2"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
        {count > 1 && <span className="hidden sm:inline">{count} photos</span>}
      </span>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center sm:bottom-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setAnimate(true);
                setPos(i);
              }}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === current || undefined}
              className="p-1.5"
            >
              <span
                className={`block h-1.5 rounded-full shadow transition-all duration-300 ${
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
