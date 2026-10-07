import type { CommissionChoice } from "../../types";

interface Props {
  options: CommissionChoice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Picture cards for a step with no price attached (what we draw, how much
 * exaggeration). Prices only appear once a style is being chosen.
 */
export default function ChoiceStep({ options, selectedId, onSelect }: Props) {
  // Two options sit side by side at a readable width rather than leaving an empty third column.
  const columns = options.length === 2 ? "sm:mx-auto sm:max-w-2xl sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    // A compact row per option on phones, so they all fit on one screen; cards from sm up.
    <div className={`grid gap-3 sm:gap-4 ${columns}`}>
      {options.map((option) => {
        const selected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={selected}
            className={`group flex overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-col ${
              selected ? "ring-2 ring-pink-500" : "ring-pink-100"
            }`}
          >
            <div className="relative w-28 shrink-0 self-stretch overflow-hidden border-pink-100 bg-white sm:aspect-square sm:w-full sm:border-b">
              <img
                src={option.image}
                alt={option.alt || option.name}
                className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {selected && (
                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white shadow sm:right-3 sm:top-3">
                  ✓
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="text-lg font-bold text-neutral-900">{option.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">{option.tagline}</p>
              <p className="mt-2 flex-1 text-sm text-neutral-600">{option.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
