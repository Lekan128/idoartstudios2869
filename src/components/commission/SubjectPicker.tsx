import type { CommissionData } from "../../types";
import { formatPrice, lowestPriceFor } from "../../lib/commission";

interface Props {
  data: CommissionData;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * What we draw. Three across even on a phone, so switching is one tap with all
 * the options in view — and each shows its "from" price, since price is the
 * first thing people compare.
 */
export default function SubjectPicker({ data, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {data.subjects.map((subject) => {
        const selected = subject.id === selectedId;
        const from = lowestPriceFor(data, subject.id);

        return (
          <button
            key={subject.id}
            type="button"
            onClick={() => onSelect(subject.id)}
            aria-pressed={selected}
            className={`relative flex flex-col overflow-hidden rounded-2xl bg-white text-center shadow-sm ring-1 transition-shadow hover:shadow-md ${
              selected ? "ring-2 ring-pink-500" : "ring-pink-100"
            }`}
          >
            <span className="relative block aspect-square w-full border-b border-pink-100 bg-white sm:aspect-[4/3]">
              <img
                src={subject.image}
                alt={subject.alt || subject.name}
                className="absolute inset-0 h-full w-full object-contain"
                loading="lazy"
              />
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white shadow sm:right-3 sm:top-3 sm:h-7 sm:w-7 sm:text-sm"
                >
                  ✓
                </span>
              )}
            </span>

            <span className="flex flex-1 flex-col justify-center px-1.5 py-2 sm:p-4">
              <span className="text-sm font-bold leading-tight text-neutral-900 sm:text-lg">{subject.name}</span>
              <span className="mt-0.5 hidden text-xs font-semibold uppercase tracking-wide text-pink-600 sm:block">
                {subject.tagline}
              </span>
              {from !== null && (
                <span className="mt-1 text-xs font-semibold text-neutral-600 sm:text-sm">
                  from {formatPrice(from, data.currency)}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
