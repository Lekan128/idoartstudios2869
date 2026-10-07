function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Scrolls a step into view, clearing the sticky navbar and honouring reduced motion. */
export function scrollToId(id: string, offset = 88): void {
  if (typeof window === "undefined") return;
  // Wait a frame so a just-rendered element is actually in the DOM before we measure it.
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  });
}

/**
 * Brings a whole step into view between the sticky navbar and a fixed element at
 * the foot of the screen (the order bar), so every option in it can be seen the
 * moment the scroll lands — never a heading with its choices hidden behind the bar.
 *
 * - "center": the step sits in the middle of that space, with a little of what
 *   came before above it for context. Used to lead the eye to the next choice.
 * - "bottom": the step's bottom sits just above the bar, with everything chosen
 *   so far in view above it. Used for the last step, right by the order button.
 *
 * A step too tall to fit is top-aligned instead, so its start is never hidden.
 */
export function scrollIntoSpace(
  id: string,
  footerId: string,
  align: "center" | "bottom" = "center",
  offset = 88,
  gap = 16,
): void {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const footer = document.getElementById(footerId)?.getBoundingClientRect().height ?? 0;
    const rect = el.getBoundingClientRect();
    const space = window.innerHeight - offset - footer - gap;

    const alignTop = rect.top + window.scrollY - offset;
    const target =
      rect.height >= space
        ? alignTop
        : align === "bottom"
          ? alignTop - (space - rect.height)
          : alignTop - (space - rect.height) / 2;

    window.scrollTo({ top: Math.max(0, target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });
}

/** Roughly how long a smooth scroll takes to settle — for following it with a cue. */
export function scrollSettleMs(): number {
  if (typeof window === "undefined") return 0;
  return prefersReducedMotion() ? 0 : 700;
}
