import type { StyleGalleryItem } from "../types";

/** A style the visitor has added to their order, keyed by the style's name. */
export type OrderLines = Record<string, number>;

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

export interface OrderSummary {
  lines: { item: StyleGalleryItem; quantity: number }[];
  /** Total of the priced lines only — quote-only styles (price 0) are excluded. */
  total: number;
  itemCount: number;
  hasQuoteOnly: boolean;
}

export function summarize(items: StyleGalleryItem[], order: OrderLines): OrderSummary {
  const lines = items
    .map((item) => ({ item, quantity: order[item.name] ?? 0 }))
    .filter((line) => line.quantity > 0);

  return {
    lines,
    total: lines.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0),
    itemCount: lines.reduce((sum, { quantity }) => sum + quantity, 0),
    hasQuoteOnly: lines.some(({ item }) => item.price <= 0),
  };
}

interface MessageOptions {
  summary: OrderSummary;
  currency: string;
  orderIntro: string;
  quoteLabel: string;
  note: string;
}

/** Builds the plain-text order that gets pre-filled into WhatsApp. */
export function buildOrderMessage({ summary, currency, orderIntro, quoteLabel, note }: MessageOptions): string {
  const lines = summary.lines.map(({ item, quantity }, i) => {
    const price = item.price > 0 ? formatPrice(item.price * quantity, currency) : quoteLabel;
    return `${i + 1}. ${item.name} x${quantity} — ${price}`;
  });

  const parts = [orderIntro, "", ...lines];

  if (summary.total > 0) {
    parts.push("", `Estimated total: ${formatPrice(summary.total, currency)}`);
    if (summary.hasQuoteOnly) {
      parts.push("(Some items still need a quote, so the final total may change.)");
    }
  }

  if (note.trim()) {
    parts.push("", `Note: ${note.trim()}`);
  }

  parts.push("", "Please let me know the next step for payment. Thank you!");
  return parts.join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}
