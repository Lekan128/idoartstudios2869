import { useState } from "react";
import type { CommissionData } from "../../types";
import type { Quote } from "../../lib/commission";
import { formatPrice } from "../../lib/commission";
import WhatsAppIcon from "../layout/WhatsAppIcon";

interface Props {
  data: CommissionData;
  quote: Quote;
  href: string;
  /** Changes each time the button should draw the eye (0 = never yet). */
  cue: number;
  onOrder: () => void;
}

/**
 * The live total and the page's one primary action. The order arrives complete
 * (every choice has a default), so this is on screen from the first second —
 * the visitor can order in one tap or adjust first and watch the price follow.
 * It slides up on arrival so its presence registers, and the button nudges when
 * the guided walk reaches the last step.
 */
export default function SummaryBar({ data, quote, href, cue, onOrder }: Props) {
  // The last cue that finished playing; a newer one means "nudge now".
  const [playedCue, setPlayedCue] = useState(0);
  const nudging = cue > playedCue;

  if (!quote.isComplete) return null;

  // Wraps rather than truncates: a long option name must never hide the style.
  const shortLine = [
    quote.subject?.name,
    quote.style?.name,
    quote.quantity > 1 ? `${quote.quantity} people` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const totalLabel = quote.total !== null ? formatPrice(quote.total, data.currency) : data.onRequestLabel;

  return (
    <div
      id="order-bar"
      className="order-bar-enter fixed inset-x-0 bottom-0 z-50 border-t border-pink-100 bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.08)]"
    >
      {/* 48rem column + the page gutters, so the content lines up with the order column at every width. */}
      <div className="mx-auto max-w-[51rem] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 flex-col" aria-live="polite">
            <span className="text-xs font-semibold leading-tight text-neutral-500">{shortLine}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-neutral-900 sm:text-xl">{totalLabel}</span>
              {quote.total !== null && quote.onRequest && (
                <span className="whitespace-nowrap text-xs font-semibold text-neutral-500">to confirm</span>
              )}
            </span>
          </p>

          {/* Brand pink, not WhatsApp green: this sends the order built on this page,
              and must not read as a generic "chat with us" button. The icon says where it goes. */}
          <a
            // A fresh element per cue, so a repeat nudge restarts the animation.
            key={cue}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOrder}
            onAnimationEnd={(e) => {
              // Several animations run at once (and the sweep on a child); finish on the swell.
              if (e.animationName === "order-nudge-swell" || e.animationName === "order-nudge-calm") setPlayedCue(cue);
            }}
            className={`relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-pink-700 sm:px-7 ${
              nudging ? "order-nudge" : ""
            }`}
          >
            {data.orderCtaLabel}
            <WhatsAppIcon />
          </a>
        </div>

        {data.orderCtaHint && <p className="mt-1.5 text-[11px] text-neutral-500 sm:text-xs">{data.orderCtaHint}</p>}
      </div>
    </div>
  );
}
