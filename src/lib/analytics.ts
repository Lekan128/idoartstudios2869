/**
 * Dependency-free event hook. Pushes to window.dataLayer when a tag manager is
 * present and is a silent no-op otherwise, so the ordering flow can be measured
 * later (where do people drop off?) without adding an analytics dependency now.
 */
type EventPayload = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...payload });
  } catch {
    // Never let measurement break an order.
  }
}
