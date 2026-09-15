import { useRef } from "react";
import homeData from "../../data/home.json";
import galleryData from "../../data/gallery.json";
import type { GalleryItem, HomeData } from "../../types";
import SectionHeading from "./SectionHeading";

const home = homeData as HomeData;
const gallery = (galleryData as { items: GalleryItem[] }).items;

export default function GallerySlideshow() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className="bg-white py-16 sm:py-20">
      <SectionHeading eyebrow={home.galleryEyebrow} title={home.galleryTitle} />

      <div className="relative mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-pink-600 text-white shadow-md hover:bg-pink-700 sm:flex"
        >
          ‹
        </button>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {gallery.map((item, i) => (
            <div
              key={i}
              className="aspect-square w-40 flex-shrink-0 snap-start overflow-hidden rounded-xl bg-pink-50 sm:w-56"
            >
              <img src={item.image} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-pink-600 text-white shadow-md hover:bg-pink-700 sm:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}
