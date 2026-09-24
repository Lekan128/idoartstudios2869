/** Scrolls a revealed step into view, clearing the sticky navbar and honouring reduced motion. */
export function scrollToId(id: string, offset = 88): void {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  // Wait a frame so the newly revealed step is actually in the DOM before we measure it.
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: reduce ? "auto" : "smooth",
    });
  });
}
