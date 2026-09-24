import type { CommissionData } from "../../types";
import { formatPrice, priceFor } from "../../lib/commission";

interface Props {
  data: CommissionData;
  subjectId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCompare: () => void;
}

export default function StyleStep({ data, subjectId, selectedId, onSelect, onCompare }: Props) {
  return (
    <div>
      {/* Deliberately side by side at every width above mobile: a visitor cannot
          judge three styles they have to click between one at a time. */}
      <div className="grid gap-4 sm:grid-cols-3">
        {data.styles.map((style) => {
          const selected = style.id === selectedId;
          const price = priceFor(data, subjectId, style.id);
          const cover = style.images?.[0];

          return (
            <div
              key={style.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all ${
                selected ? "ring-2 ring-pink-500" : "ring-pink-100"
              }`}
            >
              {style.badge && (
                <span className="absolute left-0 top-4 z-10 rounded-r-full bg-pink-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                  {style.badge}
                </span>
              )}

              <button
                type="button"
                onClick={onCompare}
                className="group relative aspect-square w-full overflow-hidden bg-pink-50"
                aria-label={`${data.styleCompareLabel} — ${style.name}`}
              >
                {cover && (
                  <img
                    src={cover.image}
                    alt={cover.alt || style.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 opacity-0 shadow transition-opacity group-hover:opacity-100">
                  Enlarge ⤢
                </span>
              </button>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-lg font-bold text-neutral-900">{style.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">{style.tagline}</p>

                <p className="mt-3 text-2xl font-extrabold text-neutral-900">
                  {price !== null ? formatPrice(price, data.currency) : data.onRequestLabel}
                </p>
                {price !== null && <p className="text-xs text-neutral-500">per person</p>}

                <p className="mt-3 text-sm text-neutral-600">{style.description}</p>
                <p className="mt-2 flex-1 text-sm font-semibold text-neutral-700">{style.bestFor}</p>

                <button
                  type="button"
                  onClick={() => onSelect(style.id)}
                  aria-pressed={selected}
                  className={`mt-5 w-full rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                    selected
                      ? "bg-neutral-900 text-white"
                      : "bg-pink-600 text-white hover:bg-pink-700"
                  }`}
                >
                  {selected ? "✓ Selected" : `Choose ${style.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onCompare}
          className="text-sm font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-700"
        >
          {data.styleCompareLabel} ⤢
        </button>
      </div>
    </div>
  );
}
