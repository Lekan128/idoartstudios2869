import type { CommissionData } from "../../types";
import { formatPrice, priceFor } from "../../lib/commission";

interface Props {
  data: CommissionData;
  subjectId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Side-by-side comparison, opened in place under the style cards rather than as
 * a pop-up, so the order bar and the rest of the order stay in view. This is the
 * single most important view for conversion: the top style costs more than twice
 * the cheapest, and nobody pays that difference for a distinction they cannot see.
 */
export default function StyleCompare({ data, subjectId, selectedId, onSelect }: Props) {
  return (
    <div id="style-compare" className="mt-5 scroll-mt-24 rounded-2xl bg-pink-50/70 p-3 sm:p-5">
      <div className="grid gap-4 md:grid-cols-3">
        {data.styles.map((style) => {
          const price = priceFor(data, subjectId, style.id);
          const selected = style.id === selectedId;

          return (
            <div key={style.id} className="flex flex-col overflow-hidden rounded-xl bg-white">
              <div className="grid grid-cols-2 gap-px bg-pink-100">
                {(style.images ?? []).slice(0, 2).map((img, i) => (
                  <div key={i} className="aspect-square bg-pink-50">
                    <img src={img.image} alt={img.alt || style.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold text-neutral-900">{style.name}</h3>
                  <span className="whitespace-nowrap font-extrabold text-neutral-900">
                    {price !== null ? formatPrice(price, data.currency) : data.onRequestLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{style.description}</p>
                <p className="mt-2 flex-1 text-sm font-semibold text-neutral-700">{style.bestFor}</p>

                <button
                  type="button"
                  onClick={() => onSelect(style.id)}
                  aria-pressed={selected}
                  className={`mt-4 w-full rounded-full px-4 py-2.5 text-sm font-bold ring-1 transition-colors ${
                    selected
                      ? "bg-pink-50 text-pink-700 ring-pink-300"
                      : "bg-white text-neutral-800 ring-pink-200 hover:bg-pink-50"
                  }`}
                >
                  {selected ? `✓ ${style.name} chosen` : `Choose ${style.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
