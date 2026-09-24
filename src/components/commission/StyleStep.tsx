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
      {/* A visitor cannot judge three styles they have to scroll between one at a
          time, so all three always fit together: compact rows on phones (tap the
          photo to enlarge), side-by-side cards from sm up. */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {data.styles.map((style) => {
          const selected = style.id === selectedId;
          const price = priceFor(data, subjectId, style.id);
          const cover = style.images?.[0];

          return (
            <div
              key={style.id}
              className={`relative flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all sm:flex-col ${
                selected ? "ring-2 ring-pink-500" : "ring-pink-100"
              }`}
            >
              {style.badge && (
                <span className="absolute left-0 top-4 z-10 hidden rounded-r-full bg-pink-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow sm:block">
                  {style.badge}
                </span>
              )}

              <button
                type="button"
                onClick={onCompare}
                className="group relative w-28 shrink-0 self-stretch overflow-hidden bg-pink-50 sm:aspect-[4/3] sm:w-full"
                aria-label={`${data.styleCompareLabel} — ${style.name}`}
              >
                {cover && (
                  <img
                    src={cover.image}
                    alt={cover.alt || style.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {selected && (
                  <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white shadow sm:hidden">
                    ✓
                  </span>
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 shadow transition-opacity sm:px-2.5 sm:py-1 sm:opacity-0 sm:group-hover:opacity-100">
                  <span className="hidden sm:inline">Enlarge </span>⤢
                </span>
              </button>

              <div className="relative flex flex-1 flex-col p-4 sm:p-5">
                {/* On phones the whole text area is the choose button. */}
                <button
                  type="button"
                  onClick={() => onSelect(style.id)}
                  aria-pressed={selected}
                  aria-label={`Choose ${style.name}`}
                  className="absolute inset-0 sm:hidden"
                />

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-lg font-bold text-neutral-900">{style.name}</h3>
                  {style.badge && (
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-700 sm:hidden">
                      {style.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 sm:min-h-[2lh]">{style.tagline}</p>

                <p className="mt-2 text-xl font-extrabold text-neutral-900 sm:mt-3 sm:text-2xl">
                  {price !== null ? formatPrice(price, data.currency) : data.onRequestLabel}
                  {price !== null && (
                    <span className="ml-1 text-xs font-normal text-neutral-500 sm:ml-0 sm:block">per person</span>
                  )}
                </p>

                <p className="mt-3 hidden text-sm text-neutral-600 sm:block">{style.description}</p>
                <p className="mt-2 hidden flex-1 text-sm font-semibold text-neutral-700 sm:block">{style.bestFor}</p>

                <button
                  type="button"
                  onClick={() => onSelect(style.id)}
                  aria-pressed={selected}
                  className={`mt-5 hidden w-full rounded-full px-5 py-2.5 text-sm font-bold transition-colors sm:block ${
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
