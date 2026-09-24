import { useEffect, useRef } from "react";
import type { CommissionData } from "../../types";
import { formatPrice, priceFor } from "../../lib/commission";

interface Props {
  data: CommissionData;
  subjectId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 * Full-screen side-by-side comparison. This is the single most important screen
 * for conversion: the top style costs more than twice the cheapest, and nobody
 * pays that difference for a distinction they cannot actually see.
 */
export default function StyleCompare({ data, subjectId, selectedId, onSelect, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={data.styleCompareLabel}
      className="fixed inset-0 z-[60] flex flex-col bg-neutral-900/90 backdrop-blur-sm"
    >
      {/* Backdrop click target sits behind the panel so taps outside close the view. */}
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="relative flex max-h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-white sm:text-xl">{data.styleStepTitle}</h2>
            <p className="text-sm text-white/70">{data.styleStepHint}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {data.styles.map((style) => {
              const price = priceFor(data, subjectId, style.id);
              const selected = style.id === selectedId;

              return (
                <div
                  key={style.id}
                  className={`flex flex-col overflow-hidden rounded-2xl bg-white ring-2 ${
                    selected ? "ring-pink-500" : "ring-transparent"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-px bg-pink-100">
                    {(style.images ?? []).slice(0, 2).map((img, i) => (
                      <div key={i} className="aspect-square bg-pink-50">
                        <img
                          src={img.image}
                          alt={img.alt || style.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-neutral-900">{style.name}</h3>
                      <span className="whitespace-nowrap font-extrabold text-pink-600">
                        {price !== null ? formatPrice(price, data.currency) : data.onRequestLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">{style.description}</p>
                    <p className="mt-2 flex-1 text-sm font-semibold text-neutral-700">{style.bestFor}</p>

                    <button
                      type="button"
                      onClick={() => {
                        onSelect(style.id);
                        onClose();
                      }}
                      className={`mt-4 w-full rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                        selected ? "bg-neutral-900 text-white" : "bg-pink-600 text-white hover:bg-pink-700"
                      }`}
                    >
                      {selected ? "✓ Selected" : `Choose ${style.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
