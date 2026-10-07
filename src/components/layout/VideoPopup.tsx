import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import reactionVideoData from "../../data/reaction-video.json";
import type { ReactionVideoData } from "../../types";
import { track } from "../../lib/analytics";

const video = reactionVideoData as ReactionVideoData;

const DISMISS_KEY = "ida.videoPopup.closed";
/** Fired by the page's full reaction video when it starts, so the two never play at once. */
export const REACTION_VIDEO_PLAY_EVENT = "ida:reaction-video-play";
/** Extra wait after the page has finished loading, so the popup arrives as a second beat. */
const APPEAR_DELAY_MS = 400;
/** Wait before the video opens on the homepage, so it arrives after the page settles. */
const OPEN_DELAY_MS = 800;

declare global {
  interface Navigator {
    connection?: { saveData?: boolean; effectiveType?: string };
  }
}

/**
 * Whether the video may open and play by itself. It never does for anyone who
 * has asked for less motion or less data, or who already closed it this visit —
 * they get the small "Watch reactions" button instead, and play it if they want.
 */
function shouldAutoOpen(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return false;
  try {
    if (window.sessionStorage.getItem(DISMISS_KEY)) return false;
  } catch {
    // Storage blocked — open it; closing still works for this page view.
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
 * A small floating reaction video, on every page: muted, looping, cropped to
 * landscape, tucked into the corner above the WhatsApp button. On the homepage
 * it opens by itself; everywhere else it waits as a small "Watch reactions"
 * button, and the player only loads when someone taps it. Nothing loads until
 * the page itself has finished loading, so it can never slow a page down.
 *
 * Tapping the video toggles sound. The ✕ shrinks it back to the button rather
 * than removing it — out of the way but never lost — and it stays shrunk for the
 * rest of the visit. A video the visitor opened themselves stays open as they
 * move between pages; one that opened by itself shrinks when they leave home.
 */
type Mode = "waiting" | "open" | "minimized";

export default function VideoPopup() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/$/, "") || "/";
  const isHome = path === "/";
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("waiting");
  const open = mode === "open";
  const openedByVisitor = useRef(false);
  const [soundOn, setSoundOn] = useState(false);
  // True while a page's own reaction video section is on screen (the homepage has
  // none today, the event page does): the popup would sit on top of it, so it
  // steps out of the way — still loaded, so it doesn't restart.
  const [makingWay, setMakingWay] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!video.youtubeId) return;
    return afterPageLoad(() => setReady(true));
  }, []);

  // Per page: open by itself on the homepage, the small button everywhere else —
  // unless the visitor opened it themselves, in which case leave it be.
  useEffect(() => {
    if (!ready || openedByVisitor.current) return;
    const auto = isHome && shouldAutoOpen();
    const timer = window.setTimeout(
      () => {
        setMode(auto ? "open" : "minimized");
        track("video_popup_shown", { opened: auto, page: pathname });
      },
      auto ? OPEN_DELAY_MS : 0,
    );
    return () => window.clearTimeout(timer);
  }, [ready, isHome, pathname]);

  // Step out of the way of a page's own reaction video section while it's on screen.
  useEffect(() => {
    if (mode === "waiting") return;
    const section = document.getElementById("reaction-video");
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setMakingWay(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(section);
    return () => {
      observer.disconnect();
      setMakingWay(false);
    };
  }, [mode, pathname]);

  // If the visitor plays the full video on the page, step aside for it.
  useEffect(() => {
    const onMainPlay = () => {
      openedByVisitor.current = false;
      setMode((m) => (m === "open" ? "minimized" : m));
    };
    window.addEventListener(REACTION_VIDEO_PLAY_EVENT, onMainPlay);
    return () => window.removeEventListener(REACTION_VIDEO_PLAY_EVENT, onMainPlay);
  }, []);

  if (mode === "waiting") return null;

  const close = () => {
    openedByVisitor.current = false;
    setMode("minimized");
    setSoundOn(false);
    track("video_popup_closed", { had_sound: soundOn });
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Not remembered — it simply opens again on the next page view.
    }
  };

  const reopen = () => {
    openedByVisitor.current = true;
    setMode("open");
    track("video_popup_reopened", { page: pathname });
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
      className={`fixed right-4 z-40 flex justify-end ${
        // Sit just above the WhatsApp button; Commission Artwork has its order bar
        // along the bottom instead, and the event page has neither, so it takes the corner.
        path === "/styles" ? "bottom-32 sm:bottom-28" : path === "/spot-on-caricature" ? "bottom-5" : "bottom-24"
      } transition duration-300 ease-out motion-reduce:transition-none sm:right-5 ${
        makingWay ? "pointer-events-none translate-y-4 opacity-0" : ""
      }`}
    >
      {open ? (
        <div className="video-popup-enter w-48 overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-black/10 sm:w-80">
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
              aria-label="Minimise video"
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // A round play button on phones, so it never sits over a page's own buttons;
        // the "Watch reactions" label joins it from sm up, where there's room.
        <button
          type="button"
          onClick={reopen}
          aria-label="Watch reactions"
          className="video-popup-enter inline-flex items-center gap-2 rounded-full bg-neutral-900/85 p-1.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-neutral-900 sm:pr-3.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 sm:h-7 sm:w-7">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            Watch reactions
          </span>
        </button>
      )}
    </aside>
  );
}
