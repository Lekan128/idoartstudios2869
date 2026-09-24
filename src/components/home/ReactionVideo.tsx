import { useState } from "react";
import reactionVideoData from "../../data/reaction-video.json";
import type { ReactionVideoData } from "../../types";
import siteData from "../../data/site.json";
import type { SiteData } from "../../types";
import SectionHeading from "./SectionHeading";

const video = reactionVideoData as ReactionVideoData;
const site = siteData as SiteData;

export default function ReactionVideo() {
  const [playing, setPlaying] = useState(false);

  if (!video.youtubeId) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      {/* A portrait video centred on its own leaves wide empty bands on desktop, so
          from md up the heading sits beside it instead of above it. */}
      <div className="mx-auto grid max-w-4xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:gap-16">
        <div>
          <SectionHeading eyebrow={video.eyebrow} title={video.title} align="responsive" />
          {video.caption && (
            <p className="mx-auto mt-4 max-w-sm text-center text-base text-neutral-600 md:mx-0 md:mt-5 md:text-left md:text-lg">
              {video.caption}
            </p>
          )}
          <a
            href={site.bookEventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 hidden items-center gap-2 rounded-full bg-pink-600 px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-pink-700 md:inline-flex"
          >
            {site.bookEventLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="relative mx-auto aspect-[9/16] w-full max-w-[17rem] overflow-hidden rounded-2xl bg-black shadow-lg md:w-72 md:max-w-none">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play video: ${video.title}`}
              className="group absolute inset-0 h-full w-full"
            >
              <img
                src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg transition-transform group-hover:scale-110">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
