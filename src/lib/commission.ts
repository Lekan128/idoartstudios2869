import type {
  CommissionAddon,
  CommissionArtworkMode,
  CommissionData,
  CommissionStyle,
  CommissionSubject,
} from "../types";

/** Everything the visitor has chosen. `null` means "not chosen yet". */
export interface Selection {
  subjectId: string | null;
  styleId: string | null;
  quantity: number;
  artworkModeId: string;
  extras: string;
  addonIds: string[];
  note: string;
}

export const EMPTY_SELECTION: Selection = {
  subjectId: null,
  styleId: null,
  quantity: 1,
  artworkModeId: "together",
  extras: "",
  addonIds: [],
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

/** Cheapest priced cell for a subject — powers the "from ₦X" labels on the step 1 cards. */
export function lowestPriceForSubject(data: CommissionData, subjectId: string): number | null {
  const prices = data.pricing.filter((p) => p.subject === subjectId && p.price > 0).map((p) => p.price);
  return prices.length ? Math.min(...prices) : null;
}

/** Cheapest priced cell overall — used for the page's opening price anchor and SEO. */
export function lowestPriceOverall(data: CommissionData): number | null {
  const prices = data.pricing.filter((p) => p.price > 0).map((p) => p.price);
  return prices.length ? Math.min(...prices) : null;
}

export interface QuoteAddonLine {
  addon: CommissionAddon;
  quantity: number;
  total: number;
}

export interface Quote {
  subject: CommissionSubject | null;
  style: CommissionStyle | null;
  artworkMode: CommissionArtworkMode | null;
  quantity: number;
  /** How many physical pieces this is — drives add-on pricing and the summary wording. */
  artworkCount: number;
  unitPrice: number | null;
  artworkSubtotal: number | null;
  addonLines: QuoteAddonLine[];
  addonsTotal: number;
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
  const style = data.styles.find((s) => s.id === selection.styleId) ?? null;
  const artworkMode = data.artworkModes.find((m) => m.id === selection.artworkModeId) ?? data.artworkModes[0] ?? null;

  const quantityOption = data.quantities.find((q) => q.value === selection.quantity);
  const quantityOnRequest = quantityOption?.onRequest ?? false;

  const unitPrice = priceFor(data, selection.subjectId, selection.styleId);

  // "Everyone together" is one physical piece however many faces are in it;
  // "separate" is one piece each. Add-ons (prints, frames) follow the pieces.
  const artworkCount = artworkMode?.id === "separate" ? Math.max(1, selection.quantity) : 1;

  const addonLines: QuoteAddonLine[] = data.addons
    .filter((a) => selection.addonIds.includes(a.id))
    .map((addon) => ({ addon, quantity: artworkCount, total: addon.price * artworkCount }));
  const addonsTotal = addonLines.reduce((sum, line) => sum + line.total, 0);

  const onRequestReasons: string[] = [];
  if (quantityOnRequest) onRequestReasons.push(`${quantityOption?.label ?? "This group size"} is priced individually`);
  if (unitPrice === null && subject && style) onRequestReasons.push(`${subject.name} in ${style.name} is priced individually`);
  if (subject?.needsExtras) onRequestReasons.push("extras are quoted individually");

  // The group-size ceiling is the only thing that stops us showing a number at all.
  // Extras still show a starting figure — a visible price converts far better than
  // a blank one — but the order is clearly flagged as needing confirmation.
  const calculable = unitPrice !== null && !quantityOnRequest;
  const artworkSubtotal = calculable ? unitPrice * selection.quantity : null;
  const total = artworkSubtotal === null ? null : artworkSubtotal + addonsTotal;

  return {
    subject,
    style,
    artworkMode,
    quantity: selection.quantity,
    artworkCount,
    unitPrice,
    artworkSubtotal,
    addonLines,
    addonsTotal,
    total,
    onRequest: onRequestReasons.length > 0,
    onRequestReasons,
    isComplete: Boolean(subject && style),
  };
}

/**
 * Short human-readable order reference (e.g. "IDA-4K7Q") so a WhatsApp chat can be
 * matched back to a specific order without the owner re-reading the whole thread.
 */
export function orderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 — these get misread aloud
  let out = "";
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `IDA-${out}`;
}

/** Builds the plain-text order that gets pre-filled into WhatsApp. */
export function buildOrderMessage(data: CommissionData, selection: Selection, q: Quote, reference: string): string {
  const parts: string[] = [data.whatsappIntro, ""];

  if (q.subject) parts.push(`Type: ${q.subject.name}`);
  if (q.style) parts.push(`Style: ${q.style.name}`);
  parts.push(`People: ${q.quantity}`);
  if (q.quantity > 1 && q.artworkMode) parts.push(`Format: ${q.artworkMode.label}`);

  if (q.subject?.needsExtras) {
    parts.push(`Extras: ${selection.extras.trim() || "(to discuss)"}`);
  }

  if (q.addonLines.length) {
    parts.push("");
    parts.push("Add-ons:");
    for (const line of q.addonLines) {
      const suffix = line.quantity > 1 ? ` x${line.quantity}` : "";
      parts.push(`- ${line.addon.name}${suffix} — ${formatPrice(line.total, data.currency)}`);
    }
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

/* --- Shareable / resumable selections ------------------------------------ */

/** Serialises a selection into query params so an order can be shared or returned to. */
export function selectionToParams(selection: Selection): URLSearchParams {
  const params = new URLSearchParams();
  if (selection.subjectId) params.set("type", selection.subjectId);
  if (selection.styleId) params.set("style", selection.styleId);
  if (selection.quantity !== 1) params.set("qty", String(selection.quantity));
  if (selection.artworkModeId !== EMPTY_SELECTION.artworkModeId) params.set("format", selection.artworkModeId);
  if (selection.addonIds.length) params.set("addons", selection.addonIds.join(","));
  return params;
}

/** Rebuilds a selection from query params, ignoring anything that no longer exists. */
export function selectionFromParams(data: CommissionData, params: URLSearchParams): Partial<Selection> {
  const out: Partial<Selection> = {};

  const type = params.get("type");
  if (type && data.subjects.some((s) => s.id === type)) out.subjectId = type;

  const style = params.get("style");
  if (style && data.styles.some((s) => s.id === style)) out.styleId = style;

  const qty = Number(params.get("qty"));
  if (data.quantities.some((q) => q.value === qty)) out.quantity = qty;

  const format = params.get("format");
  if (format && data.artworkModes.some((m) => m.id === format)) out.artworkModeId = format;

  const addons = params.get("addons");
  if (addons) {
    const ids = addons.split(",").filter((id) => data.addons.some((a) => a.id === id));
    if (ids.length) out.addonIds = ids;
  }

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
    styleId: data.styles.some((s) => s.id === merged.styleId) ? merged.styleId : null,
    quantity: data.quantities.some((q) => q.value === merged.quantity) ? merged.quantity : 1,
    artworkModeId: data.artworkModes.some((m) => m.id === merged.artworkModeId)
      ? merged.artworkModeId
      : (data.artworkModes[0]?.id ?? EMPTY_SELECTION.artworkModeId),
    // Extras text is meaningless once the subject that asked for it is gone.
    extras: subject?.needsExtras ? String(merged.extras ?? "") : "",
    addonIds: (merged.addonIds ?? []).filter((id) => data.addons.some((a) => a.id === id)),
    note: String(merged.note ?? ""),
  };
}
