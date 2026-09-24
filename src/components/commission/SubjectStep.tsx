import type { CommissionData } from "../../types";
import { formatPrice, lowestPriceForSubject } from "../../lib/commission";

interface Props {
  data: CommissionData;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function SubjectStep({ data, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {data.subjects.map((subject) => {
        const selected = subject.id === selectedId;
        const from = lowestPriceForSubject(data, subject.id);

        return (
          <button
            key={subject.id}
            type="button"
            onClick={() => onSelect(subject.id)}
            aria-pressed={selected}
            className={`group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selected ? "ring-2 ring-pink-500" : "ring-pink-100"
            }`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-pink-50">
              <img
                src={subject.image}
                alt={subject.alt || subject.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {selected && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white shadow">
                  ✓
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="text-lg font-bold text-neutral-900">{subject.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">{subject.tagline}</p>
              <p className="mt-2 flex-1 text-sm text-neutral-600">{subject.description}</p>
              {from !== null && (
                <p className="mt-3 text-sm font-bold text-neutral-900">
                  <span className="font-normal text-neutral-500">{data.fromLabel} </span>
                  {formatPrice(from, data.currency)}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
