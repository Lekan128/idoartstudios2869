import type { CommissionChoice } from "../../types";

interface Props {
  options: CommissionChoice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * The difference here is purely visual — same person, features pushed or not —
 * so the drawings have to be big enough to see it. Two cards side by side at
 * every width, so the pair can always be compared at a glance. The drawings are
 * tall and narrow, so from sm up each card puts the picture beside its name
 * rather than above it — a wide card would otherwise frame a slim figure in
 * empty space.
 */
export default function ExaggerationToggle({ options, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((option) => {
        const selected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={selected}
            className={`relative flex flex-col overflow-hidden rounded-2xl bg-white text-center shadow-sm ring-1 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:text-left ${
              selected ? "ring-2 ring-pink-500" : "ring-pink-100"
            }`}
          >
            {selected && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white shadow sm:right-3 sm:top-3"
              >
                ✓
              </span>
            )}
            <span className="relative block aspect-square w-full border-b border-pink-100 bg-white sm:aspect-auto sm:h-44 sm:w-36 sm:shrink-0 sm:border-r sm:border-b-0">
              <img
                src={option.image}
                alt={option.alt || option.name}
                className="absolute inset-0 h-full w-full object-contain p-2 sm:p-3"
                loading="lazy"
              />
            </span>

            <span className="flex flex-1 flex-col justify-center px-3 py-3 sm:px-5 sm:py-4">
              <span className="font-display text-base font-bold leading-tight text-neutral-900 sm:text-lg">
                {option.name}
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-pink-600">{option.tagline}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
