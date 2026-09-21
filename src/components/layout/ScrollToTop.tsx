import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Router navigation keeps the previous scroll position, so clicking a style
 * card halfway down the homepage would drop you halfway down the next page.
 * Hash links are left alone — those target a section on purpose.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
