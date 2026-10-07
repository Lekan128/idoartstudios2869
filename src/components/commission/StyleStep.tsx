import type { CommissionData } from "../../types";
import { formatPrice, priceFor } from "../../lib/commission";

interface Props {
  data: CommissionData;
  subjectId: string | null;
  selectedId: string | null;
  comparing: boolean;
  onSelect: (id: string) => void;
  onToggleCompare: () => void;
}

export default function StyleStep({ data, subjectId, selectedId, comparing, onSelect, onToggleCompare }: Props) {
  return (
    <div>
      {/* A visitor cannot judge three styles they have to scroll between one at a
          time, so all three always fit together: compact rows on phones,
          side-by-side cards from sm up. The whole card is the choice — the only
          filled button on this page is the order button. Each card says just
          enough to choose: name, one line, price. The full descriptions live in
          the side-by-side comparison for anyone who wants them. */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {data.styles.map((style) => {
          const selected = style.id === selectedId;
          const price = priceFor(data, subjectId, style.id);
          const cover = style.images?.[0];

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              aria-pressed={selected}
              className={`relative flex overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 transition-shadow hover:shadow-md sm:flex-col ${
                selected ? "ring-2 ring-pink-500" : "ring-pink-100"
              }`}
            >
              <span className="relative block w-28 shrink-0 self-stretch overflow-hidden bg-pink-50 sm:aspect-[4/3] sm:w-full">
                {cover && (
                  <img
                    src={cover.image}
                    alt={cover.alt || style.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </span>

              <span className="flex flex-1 flex-col p-4 sm:p-5">
                <span className="flex items-start justify-between gap-2">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-display text-lg font-bold text-neutral-900">{style.name}</span>
                    {style.badge && (
                      <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-700">
                        {style.badge}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? "bg-pink-600 text-white" : "ring-2 ring-inset ring-pink-200"
                    }`}
                  >
                    {selected && "✓"}
                  </span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-pink-600 sm:min-h-[2lh]">
                  {style.tagline}
                </span>

                <span className="mt-2 block text-xl font-extrabold text-neutral-900 sm:mt-3 sm:text-2xl">
                  {price !== null ? formatPrice(price, data.currency) : data.onRequestLabel}
                  {price !== null && <span className="ml-1 text-xs font-normal text-neutral-500">per person</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onToggleCompare}
          aria-expanded={comparing}
          aria-controls="style-compare"
          className="text-sm font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-700"
        >
          {comparing ? "Hide the comparison" : data.styleCompareLabel}
        </button>
      </div>
    </div>
  );
}
