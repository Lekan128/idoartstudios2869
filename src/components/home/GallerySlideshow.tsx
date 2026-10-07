import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import homeData from "../../data/home.json";
import galleryData from "../../data/gallery.json";
import type { GalleryItem, HomeData } from "../../types";
import SectionHeading from "./SectionHeading";

const home = homeData as HomeData;
const gallery = (galleryData as { items: GalleryItem[] }).items;

const GAP = 16; // gap-4 between cards
/** How long the row rests on each stop before moving on. */
const STOP_MS = 3000;
/** After someone swipes, drags or uses an arrow, wait this long before autoplay resumes. */
const RESUME_AFTER_MS = 6000;

/**
 * The set is repeated so the row can scroll forever in one direction: when it
 * drifts into the second copy, it jumps back by exactly one set — identical
 * pixels, so nothing visibly moves. Enough copies to cover the widest row
 * (~1100px) plus one step, however few photos the CMS holds.
 */
const COPIES = gallery.length > 1 ? 1 + Math.ceil(6 / gallery.length) : 1;
const slides = Array.from({ length: COPIES }, (_, copy) => gallery.map((item) => ({ item, copy }))).flat();

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
}

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? "Next" : "Previous"}
      className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-pink-600 shadow-lg ring-1 ring-pink-100 transition-colors hover:bg-pink-600 hover:text-white sm:flex ${
        dir === 1 ? "right-2 lg:-right-3" : "left-2 lg:-left-3"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === 1 ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
      </svg>
    </button>
  );
}

export default function GallerySlideshow() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // The visitor's own play/pause choice. Moving content needs a way to stop it.
  const [playing, setPlaying] = useState(true);
  const [reducedMotion] = useState(prefersReducedMotion);
  // Reasons to hold still for now, without overriding the visitor's choice.
  const hold = useRef({ hover: false, focus: false, offscreen: true, until: 0 });

  /** Width of one full set of photos, or 0 when the row can't loop seamlessly. */
  const setWidth = useCallback((): number => {
    const track = trackRef.current;
    if (!track || COPIES < 2) return 0;
    const first = track.children[0] as HTMLElement | undefined;
    const twin = track.children[gallery.length] as HTMLElement | undefined;
    if (!first || !twin) return 0;
    const width = twin.offsetLeft - first.offsetLeft;
    const step = first.offsetWidth + GAP;
    // The copies after the first must cover the visible row plus one step.
    return width * (COPIES - 1) >= track.clientWidth + step ? width : 0;
  }, []);

  /** Moves the scroll position without animating — used only between identical copies. */
  const jump = (track: HTMLElement, by: number) => {
    track.scrollTo({ left: track.scrollLeft + by, behavior: "instant" });
  };

  // Step by one card (plus the gap). In a looping row, first hop to the matching
  // spot in the middle copy so there's always room to move either way. A row that
  // can't loop clamps instead — Chrome silently ignores a smooth scroll that
  // overshoots the end of a snapping track — and wraps around at either end.
  const step = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      const card = track?.firstElementChild as HTMLElement | null;
      if (!track || !card) return;
      const distance = card.offsetWidth + GAP;
      const width = setWidth();

      if (width) {
        if (dir === 1 && track.scrollLeft >= width - 2) jump(track, -width);
        if (dir === -1 && track.scrollLeft <= 2) jump(track, width);
        track.scrollTo({ left: track.scrollLeft + dir * distance, behavior: "smooth" });
        return;
      }

      const max = track.scrollWidth - track.clientWidth;
      const atEnd = dir === 1 ? track.scrollLeft >= max - 2 : track.scrollLeft <= 2;
      const target = atEnd ? (dir === 1 ? 0 : max) : Math.min(max, Math.max(0, track.scrollLeft + dir * distance));
      track.scrollTo({ left: target, behavior: "smooth" });
    },
    [setWidth],
  );

  /** Someone is driving it themselves — stay out of their way for a while. */
  const holdForInteraction = () => {
    hold.current.until = Date.now() + RESUME_AFTER_MS;
  };

  // Once a scroll settles (autoplay, swipe or arrow), if it ended past the first
  // set, jump back into it so the row never runs out.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer: number | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const width = setWidth();
        if (width && track.scrollLeft >= width) jump(track, -width);
      }, 150);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [setWidth]);

  // Only play while the gallery is actually on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      hold.current.offscreen = false;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        hold.current.offscreen = !entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Scroll, stop, scroll, stop… for as long as the page is open.
  useEffect(() => {
    if (!playing || reducedMotion || gallery.length < 2) return;
    const id = window.setInterval(() => {
      const h = hold.current;
      if (h.hover || h.focus || h.offscreen || document.hidden || Date.now() < h.until) return;
      step(1);
    }, STOP_MS);
    return () => window.clearInterval(id);
  }, [playing, reducedMotion, step]);

  if (gallery.length === 0) return null;

  // Hover pause is for mouse users only: a tap on a phone would otherwise leave a
  // sticky "hover" that freezes the row until they tap somewhere else.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === "mouse") hold.current.hover = true;
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") hold.current.hover = false;
  };

  return (
    <section ref={sectionRef} id="gallery" className="scroll-mt-20 bg-white pb-16 pt-4 sm:pb-20 sm:pt-6">
      <SectionHeading eyebrow={home.galleryEyebrow} title={home.galleryTitle} />

      <div
        className="relative mx-auto mt-10 max-w-6xl sm:px-6"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={() => (hold.current.focus = true)}
        onBlur={() => (hold.current.focus = false)}
      >
        <Arrow
          dir={-1}
          onClick={() => {
            holdForInteraction();
            step(-1);
          }}
        />

        {/* Full-bleed on phones so the next card peeks in from the screen edge,
            which is the cue that the row scrolls. */}
        <div
          ref={trackRef}
          onPointerDown={holdForInteraction}
          onWheel={holdForInteraction}
          onTouchStart={holdForInteraction}
          className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {slides.map(({ item, copy }, i) => (
            <div
              key={i}
              // Only the first copy is announced; the rest exist to make the loop seamless.
              aria-hidden={copy > 0 || undefined}
              className="aspect-square w-[70%] max-w-64 flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-pink-50 sm:w-60 sm:max-w-none"
            >
              <img src={item.image} alt={copy > 0 ? "" : item.alt} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        <Arrow
          dir={1}
          onClick={() => {
            holdForInteraction();
            step(1);
          }}
        />
      </div>

      {!reducedMotion && gallery.length > 1 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-pink-50 hover:text-pink-700"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5v14l11-7z" />}
            </svg>
            {playing ? "Pause slideshow" : "Play slideshow"}
          </button>
        </div>
      )}
    </section>
  );
}
