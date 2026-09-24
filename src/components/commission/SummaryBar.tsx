import { useState } from "react";
import type { CommissionData } from "../../types";
import type { Quote } from "../../lib/commission";
import { formatPrice } from "../../lib/commission";

interface Props {
  data: CommissionData;
  quote: Quote;
  note: string;
  reference: string;
  href: string;
  onNoteChange: (note: string) => void;
  onClear: () => void;
  onOrder: () => void;
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.42a9.87 9.87 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.19-.14.3-.28.47-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.7 1.16 1.51 1.88 1.04.93 1.91 1.22 2.19 1.36.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.27.37-.22.62-.13.26.09 1.62.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

/**
 * The live total. It appears the moment a style is chosen and follows the visitor
 * down the page — watching the number resolve is what turns browsing into an order.
 */
export default function SummaryBar({
  data,
  quote,
  note,
  reference,
  href,
  onNoteChange,
  onClear,
  onOrder,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!quote.isComplete) return null;

  const headline = `${quote.quantity} × ${quote.subject?.name} — ${quote.style?.name}`;
  // Short enough to never truncate on a phone; the full breakdown is one tap away.
  const shortLine = [
    quote.subject?.name,
    quote.style?.name,
    quote.quantity > 1 ? `${quote.quantity} people` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const totalLabel = quote.total !== null ? formatPrice(quote.total, data.currency) : data.onRequestLabel;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-pink-100 bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        {open && (
          <div className="mb-3 max-h-[50vh] overflow-y-auto rounded-xl bg-pink-50/70 p-4">
            <h3 className="text-sm font-bold text-neutral-900">{data.summaryTitle}</h3>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-neutral-700">
                  {headline}
                  {quote.quantity > 1 && quote.artworkMode && (
                    <span className="block text-xs text-neutral-500">{quote.artworkMode.label}</span>
                  )}
                </dt>
                <dd className="whitespace-nowrap font-semibold text-neutral-900">
                  {quote.artworkSubtotal !== null
                    ? formatPrice(quote.artworkSubtotal, data.currency)
                    : data.onRequestLabel}
                </dd>
              </div>

              {quote.addonLines.map(({ addon, quantity, total }) => (
                <div key={addon.id} className="flex items-start justify-between gap-4">
                  <dt className="text-neutral-700">
                    {addon.name}
                    {quantity > 1 && <span className="font-semibold"> ×{quantity}</span>}
                  </dt>
                  <dd className="whitespace-nowrap font-semibold text-neutral-900">
                    {formatPrice(total, data.currency)}
                  </dd>
                </div>
              ))}
            </dl>

            {quote.onRequest && (
              <p className="mt-3 rounded-lg bg-white p-3 text-xs text-neutral-600 ring-1 ring-pink-100">
                To be confirmed on WhatsApp: {quote.onRequestReasons.join("; ")}.
              </p>
            )}

            <label className="mt-4 block text-xs font-semibold text-neutral-600" htmlFor="commission-note">
              {data.noteLabel}
            </label>
            <textarea
              id="commission-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={2}
              placeholder={data.notePlaceholder}
              className="mt-1 w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-pink-400"
            />

            {data.orderCtaHint && <p className="mt-3 text-xs text-neutral-500 sm:hidden">{data.orderCtaHint}</p>}

            <div className="mt-3 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-neutral-500 underline underline-offset-4 hover:text-pink-600"
              >
                {data.startOverLabel}
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Ref {reference}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} order details`}
            className="flex min-w-0 flex-col items-start text-left"
          >
            <span className="max-w-full truncate text-xs font-semibold text-neutral-500">{shortLine}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-neutral-900 sm:text-xl">{totalLabel}</span>
              {quote.total !== null && quote.onRequest && (
                <span className="text-xs font-semibold text-neutral-500">to confirm</span>
              )}
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-pink-600">
                Details
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <path d="M6 15l6-6 6 6" />
                </svg>
              </span>
            </span>
          </button>

          {/* Brand pink, not WhatsApp green: this sends the order built on this page,
              and must not read as a generic "chat with us" button. The icon says where it goes. */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOrder}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-pink-700 sm:px-7"
          >
            {data.orderCtaLabel}
            <WhatsAppIcon />
          </a>
        </div>

        {data.orderCtaHint && (
          <p className="mt-1.5 hidden text-[11px] text-neutral-500 sm:block">{data.orderCtaHint}</p>
        )}
      </div>
    </div>
  );
}
