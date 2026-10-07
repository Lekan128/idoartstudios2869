import type {
  CommissionArtworkMode,
  CommissionChoice,
  CommissionData,
  CommissionStyle,
  CommissionSubject,
} from "../types";

/** Everything the visitor has chosen. `null` means "not chosen yet". */
export interface Selection {
  subjectId: string | null;
  exaggerationId: string | null;
  styleId: string | null;
  quantity: number;
  artworkModeId: string;
  extras: string;
  note: string;
}

export const EMPTY_SELECTION: Selection = {
  subjectId: null,
  exaggerationId: null,
  styleId: null,
  quantity: 1,
  artworkModeId: "together",
  extras: "",
  note: "",
};

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // An invalid/unknown currency code from the CMS shouldn't blank out prices.
    return `${currency} ${amount.toLocaleString("en-NG")}`;
  }
}

/** Price for one person in one artwork, or null when that pair has no price set. */
export function priceFor(data: CommissionData, subjectId: string | null, styleId: string | null): number | null {
  if (!subjectId || !styleId) return null;
  const row = data.pricing.find((p) => p.subject === subjectId && p.style === styleId);
  return row && row.price > 0 ? row.price : null;
}

/** Cheapest priced style for one option — the "from" price on the homepage cards. */
export function lowestPriceFor(data: CommissionData, subjectId: string): number | null {
  const prices = data.pricing.filter((p) => p.subject === subjectId && p.price > 0).map((p) => p.price);
  return prices.length ? Math.min(...prices) : null;
}

/** Cheapest priced cell overall — used for the page's opening price anchor and SEO. */
export function lowestPriceOverall(data: CommissionData): number | null {
  const prices = data.pricing.filter((p) => p.price > 0).map((p) => p.price);
  return prices.length ? Math.min(...prices) : null;
}

export interface Quote {
  subject: CommissionSubject | null;
  exaggeration: CommissionChoice | null;
  style: CommissionStyle | null;
  artworkMode: CommissionArtworkMode | null;
  quantity: number;
  unitPrice: number | null;
  artworkSubtotal: number | null;
  /** null whenever the figure can't be calculated — see `onRequest`. */
  total: number | null;
  /** True when the final price has to be confirmed by hand on WhatsApp. */
  onRequest: boolean;
  /** Plain-English reasons the price is (or may still be) confirmed manually. */
  onRequestReasons: string[];
  /** Enough chosen to show a summary and send an order. */
  isComplete: boolean;
}

export function quote(data: CommissionData, selection: Selection): Quote {
  const subject = data.subjects.find((s) => s.id === selection.subjectId) ?? null;
  const exaggeration = data.exaggerations.find((e) => e.id === selection.exaggerationId) ?? null;
  const style = data.styles.find((s) => s.id === selection.styleId) ?? null;
  const artworkMode = data.artworkModes.find((m) => m.id === selection.artworkModeId) ?? data.artworkModes[0] ?? null;

  const quantityOption = data.quantities.find((q) => q.value === selection.quantity);
  const quantityOnRequest = quantityOption?.onRequest ?? false;

  const unitPrice = priceFor(data, selection.subjectId, selection.styleId);

  const onRequestReasons: string[] = [];
  if (quantityOnRequest) onRequestReasons.push(`${quantityOption?.label ?? "This group size"} is priced individually`);
  if (unitPrice === null && subject && style) onRequestReasons.push(`${subject.name} in ${style.name} is priced individually`);
  if (subject?.needsExtras) onRequestReasons.push("extras are quoted individually");

  // The group-size ceiling is the only thing that stops us showing a number at all.
  // Extras still show a starting figure — a visible price converts far better than
  // a blank one — but the order is clearly flagged as needing confirmation.
  const calculable = unitPrice !== null && !quantityOnRequest;
  const artworkSubtotal = calculable ? unitPrice * selection.quantity : null;
  const total = artworkSubtotal;

  return {
    subject,
    exaggeration,
    style,
    artworkMode,
    quantity: selection.quantity,
    unitPrice,
    artworkSubtotal,
    total,
    onRequest: onRequestReasons.length > 0,
    onRequestReasons,
    isComplete: Boolean(subject && exaggeration && style),
  };
}

/**
 * Short human-readable order reference (e.g. "IDA-4K7Q") so a WhatsApp chat can be
 * matched back to a specific order without the owner re-reading the whole thread.
 */
export function orderReference(prefix = "IDA"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 — these get misread aloud
  let out = "";
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}

/** Builds the plain-text order that gets pre-filled into WhatsApp. */
export function buildOrderMessage(data: CommissionData, selection: Selection, q: Quote, reference: string): string {
  const parts: string[] = [data.whatsappIntro, ""];

  if (q.subject) parts.push(`Type: ${q.subject.name}`);
  if (q.exaggeration) parts.push(`Exaggeration: ${q.exaggeration.name}`);
  if (q.style) parts.push(`Style: ${q.style.name}`);
  parts.push(`People: ${q.quantity}`);
  if (q.quantity > 1 && q.artworkMode) parts.push(`Format: ${q.artworkMode.label}`);

  if (q.subject?.needsExtras) {
    parts.push(`Extras: ${selection.extras.trim() || "(to discuss)"}`);
  }

  parts.push("");
  if (q.total !== null) {
    parts.push(`Total: ${formatPrice(q.total, data.currency)}`);
    if (q.onRequest) parts.push(`(To confirm: ${q.onRequestReasons.join("; ")}.)`);
  } else {
    parts.push(`Total: ${data.onRequestLabel}`);
    if (q.onRequestReasons.length) parts.push(`(${q.onRequestReasons.join("; ")}.)`);
  }

  if (selection.note.trim()) {
    parts.push("", `Note: ${selection.note.trim()}`);
  }

  parts.push("", data.whatsappClosing, `Order ref: ${reference}`);
  return parts.join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

/**
 * Fills every unanswered choice with its default, so the visitor arrives at a
 * complete, priced order and only changes what they care about. The style
 * defaults to the CMS pick (else the badged "Most popular" one), the option to
 * the first listed.
 */
export function withDefaults(data: CommissionData, selection: Selection): Selection {
  const style =
    data.styles.find((s) => s.id === data.defaultStyle) ?? data.styles.find((s) => s.badge) ?? data.styles[0];
  const exaggeration = data.exaggerations.find((e) => e.id === data.defaultExaggeration) ?? data.exaggerations[0];

  return sanitizeSelection(data, {
    ...selection,
    subjectId: selection.subjectId ?? data.subjects[0]?.id ?? null,
    exaggerationId: selection.exaggerationId ?? exaggeration?.id ?? null,
    styleId: selection.styleId ?? style?.id ?? null,
  });
}

/* --- Shareable / resumable selections ------------------------------------ */

/** Serialises a selection into query params so an order can be shared or returned to. */
export function selectionToParams(selection: Selection): URLSearchParams {
  const params = new URLSearchParams();
  if (selection.subjectId) params.set("type", selection.subjectId);
  if (selection.exaggerationId) params.set("exaggeration", selection.exaggerationId);
  if (selection.styleId) params.set("style", selection.styleId);
  if (selection.quantity !== 1) params.set("qty", String(selection.quantity));
  if (selection.artworkModeId !== EMPTY_SELECTION.artworkModeId) params.set("format", selection.artworkModeId);
  return params;
}

/** Rebuilds a selection from query params, ignoring anything that no longer exists. */
export function selectionFromParams(data: CommissionData, params: URLSearchParams): Partial<Selection> {
  const out: Partial<Selection> = {};

  const type = params.get("type");
  if (type && data.subjects.some((s) => s.id === type)) out.subjectId = type;

  const exaggeration = params.get("exaggeration");
  if (exaggeration && data.exaggerations.some((e) => e.id === exaggeration)) out.exaggerationId = exaggeration;

  const style = params.get("style");
  if (style && data.styles.some((s) => s.id === style)) out.styleId = style;

  const qty = Number(params.get("qty"));
  if (data.quantities.some((q) => q.value === qty)) out.quantity = qty;

  const format = params.get("format");
  if (format && data.artworkModes.some((m) => m.id === format)) out.artworkModeId = format;

  return out;
}

/**
 * Drops anything that no longer exists in the CMS data. A selection can arrive from a
 * shared link or from localStorage weeks after a style was renamed or removed, and a
 * stale id must degrade to "not chosen yet" rather than a broken or mispriced order.
 */
export function sanitizeSelection(data: CommissionData, selection: Partial<Selection>): Selection {
  const merged = { ...EMPTY_SELECTION, ...selection };
  const subject = data.subjects.find((s) => s.id === merged.subjectId) ?? null;

  return {
    subjectId: subject?.id ?? null,
    exaggerationId: data.exaggerations.some((e) => e.id === merged.exaggerationId) ? merged.exaggerationId : null,
    styleId: data.styles.some((s) => s.id === merged.styleId) ? merged.styleId : null,
    quantity: data.quantities.some((q) => q.value === merged.quantity) ? merged.quantity : 1,
    artworkModeId: data.artworkModes.some((m) => m.id === merged.artworkModeId)
      ? merged.artworkModeId
      : (data.artworkModes[0]?.id ?? EMPTY_SELECTION.artworkModeId),
    // Extras text is meaningless once the subject that asked for it is gone.
    extras: subject?.needsExtras ? String(merged.extras ?? "") : "",
    note: String(merged.note ?? ""),
  };
}
