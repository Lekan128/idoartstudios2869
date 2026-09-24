import type { CommissionData } from "../../types";

interface Props {
  data: CommissionData;
  quantity: number;
  artworkModeId: string;
  onQuantityChange: (quantity: number) => void;
  onModeChange: (id: string) => void;
}

export default function QuantityStep({ data, quantity, artworkModeId, onQuantityChange, onModeChange }: Props) {
  const selectedOption = data.quantities.find((q) => q.value === quantity);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {data.quantities.map((option) => {
          const selected = option.value === quantity;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onQuantityChange(option.value)}
              aria-pressed={selected}
              className={`rounded-full px-5 py-2.5 text-sm font-bold ring-1 transition-colors ${
                selected
                  ? "bg-pink-600 text-white ring-pink-600"
                  : "bg-white text-neutral-700 ring-pink-200 hover:bg-pink-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {selectedOption?.onRequest && (
        <p className="mt-4 rounded-xl bg-pink-50 p-4 text-sm text-neutral-700 ring-1 ring-pink-100">
          {data.quantityOnRequestNotice}
        </p>
      )}

      {/* Two people in one piece is a different job from two separate pieces. Asking
          costs the visitor one tap and removes the commonest source of order disputes. */}
      {quantity > 1 && (
        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-neutral-900">How should we draw them?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.artworkModes.map((mode) => {
              const selected = mode.id === artworkModeId;
              return (
                <label
                  key={mode.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 transition-colors ${
                    selected ? "ring-2 ring-pink-500" : "ring-pink-100 hover:bg-pink-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="artwork-mode"
                    value={mode.id}
                    checked={selected}
                    onChange={() => onModeChange(mode.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-pink-600"
                  />
                  <span>
                    <span className="block text-sm font-bold text-neutral-900">{mode.label}</span>
                    <span className="block text-xs text-neutral-600">{mode.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
