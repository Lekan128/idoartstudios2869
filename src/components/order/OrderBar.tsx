import { useState } from "react";
import { formatPrice } from "../../lib/order";
import type { OrderSummary } from "../../lib/order";

interface Props {
  summary: OrderSummary;
  currency: string;
  quoteLabel: string;
  note: string;
  onNoteChange: (note: string) => void;
  onClear: () => void;
  href: string;
}

export default function OrderBar({ summary, currency, quoteLabel, note, onNoteChange, onClear, href }: Props) {
  const [open, setOpen] = useState(false);

  if (summary.itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-pink-100 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        {open && (
          <div className="mb-3 max-h-56 overflow-y-auto rounded-xl bg-pink-50/70 p-4">
            <ul className="space-y-2 text-sm">
              {summary.lines.map(({ item, quantity }) => (
                <li key={item.name} className="flex items-center justify-between gap-4">
                  <span className="text-neutral-700">
                    {item.name} <span className="font-semibold">x{quantity}</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold text-neutral-900">
                    {item.price > 0 ? formatPrice(item.price * quantity, currency) : quoteLabel}
                  </span>
                </li>
              ))}
            </ul>

            <label className="mt-4 block text-xs font-semibold text-neutral-600" htmlFor="order-note">
              Anything we should know? (optional)
            </label>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={2}
              placeholder="e.g. it's a birthday gift, I need it before Saturday…"
              className="mt-1 w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-pink-400"
            />

            <button
              type="button"
              onClick={onClear}
              className="mt-3 text-xs font-semibold text-neutral-500 underline underline-offset-4 hover:text-pink-600"
            >
              Clear order
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex min-w-0 flex-col items-start text-left"
          >
            <span className="text-xs font-semibold text-neutral-500">
              {summary.itemCount} item{summary.itemCount === 1 ? "" : "s"} · {open ? "Hide" : "View"} order
            </span>
            <span className="text-lg font-extrabold text-neutral-900">
              {summary.total > 0 ? formatPrice(summary.total, currency) : quoteLabel}
              {summary.total > 0 && summary.hasQuoteOnly && (
                <span className="ml-1 text-xs font-semibold text-neutral-500">+ quote</span>
              )}
            </span>
          </button>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 sm:px-7"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.42a9.87 9.87 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.19-.14.3-.28.47-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.7 1.16 1.51 1.88 1.04.93 1.91 1.22 2.19 1.36.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.27.37-.22.62-.13.26.09 1.62.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.17 1.36Z" />
            </svg>
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
