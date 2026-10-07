import { useEffect, useRef, useState } from "react";
import reactionVideoData from "../../data/reaction-video.json";
import type { ReactionVideoData } from "../../types";
import { track } from "../../lib/analytics";

const video = reactionVideoData as ReactionVideoData;

const DISMISS_KEY = "ida.videoPopup.closed";
/** Fired by the page's full reaction video when it starts, so the two never play at once. */
export const REACTION_VIDEO_PLAY_EVENT = "ida:reaction-video-play";
/** Extra wait after the page has finished loading, so the popup arrives as a second beat. */
const APPEAR_DELAY_MS = 1200;

declare global {
  interface Navigator {
    connection?: { saveData?: boolean; effectiveType?: string };
  }
}

/**
 * Whether to show the popup at all. It's a nice-to-have, so it steps aside for
 * anyone who has asked for less motion or less data (the full video is still on
 * the page), and for anyone who already closed it this visit.
 */
function shouldShow(): boolean {
  if (typeof window === "undefined" || !video.youtubeId) return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return false;
  try {
    if (window.sessionStorage.getItem(DISMISS_KEY)) return false;
  } catch {
    // Storage blocked — show it; closing still works for this page view.
  }
  return true;
}

/** Runs `fn` once the page has fully loaded and the browser is idle. */
function afterPageLoad(fn: () => void): () => void {
  let timer: number | undefined;
  let idle: number | undefined;
  const schedule = () => {
    const run = () => {
      timer = window.setTimeout(fn, APPEAR_DELAY_MS);
    };
    if ("requestIdleCallback" in window) idle = window.requestIdleCallback(run, { timeout: 2000 });
    else run();
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    window.removeEventListener("load", schedule);
    if (idle !== undefined) window.cancelIdleCallback?.(idle);
    window.clearTimeout(timer);
  };
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
      {on ? (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      ) : (
        <path d="m16 9 6 6M22 9l-6 6" />
      )}
    </svg>
  );
}

/**
 * A small floating reaction video on the homepage: muted, looping, cropped to
 * landscape, tucked into the corner above the WhatsApp button. Nothing loads
 * until the page itself has finished loading, so it can never slow the page down.
 * Tapping the video toggles sound; the ✕ closes it for the rest of the visit.
 */
export default function VideoPopup() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  // True while a page's own reaction video section is on screen (the homepage has
  // none today, the event page does): the popup would sit on top of it, so it
  // steps out of the way — still loaded, so it doesn't restart.
  const [makingWay, setMakingWay] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!shouldShow()) return;
    return afterPageLoad(() => {
      setOpen(true);
      track("video_popup_shown");
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const section = document.getElementById("reaction-video");
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setMakingWay(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [open]);

  // If the visitor plays the full video on the page, step aside for it.
  useEffect(() => {
    const onMainPlay = () => setOpen(false);
    window.addEventListener(REACTION_VIDEO_PLAY_EVENT, onMainPlay);
    return () => window.removeEventListener(REACTION_VIDEO_PLAY_EVENT, onMainPlay);
  }, []);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    track("video_popup_closed", { had_sound: soundOn });
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Not remembered — it simply shows again on the next page view.
    }
  };

  // The YouTube player takes commands over postMessage once enablejsapi=1 is set.
  const toggleSound = () => {
    const next = !soundOn;
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "unMute" : "mute", args: [] }),
      "*",
    );
    setSoundOn(next);
    if (next) track("video_popup_unmuted");
  };

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: video.youtubeId, // loop only works with a playlist, even of one
    controls: "0",
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
  });

  return (
    <aside
      aria-label={`Video: ${video.title}`}
      inert={makingWay}
      className="video-popup-enter fixed bottom-24 right-4 z-40 w-48 sm:right-5 sm:w-80"
    >
      <div
        className={`overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-black/10 transition duration-300 ease-out motion-reduce:transition-none ${
          makingWay ? "pointer-events-none translate-y-4 opacity-0" : ""
        }`}
      >
        {/* Landscape window onto a portrait video: the player is sized to the full
            9:16 frame and centred, so the top and bottom fall outside and are cut off. */}
        <div className="relative aspect-video w-full overflow-hidden">
          <iframe
            ref={frameRef}
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?${params}`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
            className="pointer-events-none absolute left-0 top-1/2 aspect-[9/16] w-full -translate-y-1/2"
          />

          {/* The whole video is the sound switch — the commonest gesture for a muted clip. */}
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            className="absolute inset-0 flex items-end justify-start p-2"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <SoundIcon on={soundOn} />
              {soundOn ? "Sound on" : "Tap for sound"}
            </span>
          </button>

          <button
            type="button"
            onClick={close}
            aria-label="Close video"
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
