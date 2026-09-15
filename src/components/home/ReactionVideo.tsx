import { useState } from "react";
import reactionVideoData from "../../data/reaction-video.json";
import type { ReactionVideoData } from "../../types";
import SectionHeading from "./SectionHeading";

const video = reactionVideoData as ReactionVideoData;

export default function ReactionVideo() {
  const [playing, setPlaying] = useState(false);

  if (!video.youtubeId) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <SectionHeading eyebrow={video.eyebrow} title={video.title} />

      <div className="mx-auto mt-10 max-w-xs px-4 sm:px-6">
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-lg">
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

        {video.caption && <p className="mt-4 text-center text-sm text-neutral-600">{video.caption}</p>}
      </div>
    </section>
  );
}
