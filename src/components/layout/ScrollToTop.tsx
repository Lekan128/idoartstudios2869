import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Router navigation keeps the previous scroll position, so clicking a style
 * card halfway down the homepage would drop you halfway down the next page.
 * Links with a hash target a section on purpose (e.g. Book an Event →
 * /spot-on-caricature/#plans): those scroll to it — smoothly when already on
 * that page, instantly when arriving from another one.
 */
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;

    if (!hash) {
      if (!samePage) window.scrollTo(0, 0);
      return;
    }

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const target = () => document.getElementById(decodeURIComponent(hash.slice(1)));
    let cancelled = false;
    // Wait a frame so a page that just mounted has rendered the section.
    const frame = requestAnimationFrame(() => {
      target()?.scrollIntoView({ behavior: samePage && !reduce ? "smooth" : "auto", block: "start" });
      // Arriving from another page, the web fonts can still be loading; when they
      // land the text above reflows and the section shifts. Line it up again then,
      // unless the visitor has already scrolled away themselves.
      if (!samePage) {
        const settledAt = window.scrollY;
        document.fonts?.ready.then(() => {
          if (!cancelled && Math.abs(window.scrollY - settledAt) < 4) {
            target()?.scrollIntoView({ behavior: "auto", block: "start" });
          }
        });
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
    // `key` changes on every navigation, so clicking the same link twice still scrolls.
  }, [pathname, hash, key]);

  return null;
}
