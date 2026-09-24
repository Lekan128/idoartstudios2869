import { useRef } from "react";
import homeData from "../../data/home.json";
import galleryData from "../../data/gallery.json";
import type { GalleryItem, HomeData } from "../../types";
import SectionHeading from "./SectionHeading";

const home = homeData as HomeData;
const gallery = (galleryData as { items: GalleryItem[] }).items;

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
  const trackRef = useRef<HTMLDivElement>(null);

  // Step by one card (plus the gap). The target is clamped because Chrome silently
  // ignores a smooth scroll that overshoots the end of a snapping track; at either
  // end the arrow wraps around instead of doing nothing.
  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;

    const max = track.scrollWidth - track.clientWidth;
    const atEnd = dir === 1 ? track.scrollLeft >= max - 2 : track.scrollLeft <= 2;
    const target = atEnd
      ? (dir === 1 ? 0 : max)
      : Math.min(max, Math.max(0, track.scrollLeft + dir * (card.offsetWidth + 16)));
    track.scrollTo({ left: target, behavior: "smooth" });
  };

  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className="scroll-mt-20 bg-white pb-16 pt-4 sm:pb-20 sm:pt-6">
      <SectionHeading eyebrow={home.galleryEyebrow} title={home.galleryTitle} />

      <div className="relative mx-auto mt-10 max-w-6xl sm:px-6">
        <Arrow dir={-1} onClick={() => scrollBy(-1)} />

        {/* Full-bleed on phones so the next card peeks in from the screen edge,
            which is the cue that the row scrolls. */}
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {gallery.map((item, i) => (
            <div
              key={i}
              className="aspect-square w-[70%] max-w-64 flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-pink-50 sm:w-60 sm:max-w-none"
            >
              <img src={item.image} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        <Arrow dir={1} onClick={() => scrollBy(1)} />
      </div>
    </section>
  );
}
