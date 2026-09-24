import type { CommissionData } from "../../types";
import { formatPrice } from "../../lib/commission";

interface Props {
  data: CommissionData;
  selectedIds: string[];
  artworkCount: number;
  onToggle: (id: string) => void;
}

/**
 * Deliberately the last step. Add-ons are offered only after the visitor has
 * committed to a style — offered earlier they read as an upsell and add friction
 * to the decision that actually matters.
 */
export default function AddonStep({ data, selectedIds, artworkCount, onToggle }: Props) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.addons.map((addon) => {
          const selected = selectedIds.includes(addon.id);
          const total = addon.price * artworkCount;

          return (
            <label
              key={addon.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 transition-colors ${
                selected ? "ring-2 ring-pink-500" : "ring-pink-100 hover:bg-pink-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(addon.id)}
                className="mt-1 h-4 w-4 shrink-0 accent-pink-600"
              />
              <span className="flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-neutral-900">{addon.name}</span>
                  <span className="whitespace-nowrap text-sm font-bold text-pink-600">
                    +{formatPrice(total, data.currency)}
                  </span>
                </span>
                <span className="block text-xs text-neutral-600">{addon.description}</span>
                {artworkCount > 1 && (
                  <span className="mt-1 block text-[11px] font-semibold text-neutral-500">
                    {formatPrice(addon.price, data.currency)} × {artworkCount} artworks
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {data.addonNote && <p className="mt-3 text-xs text-neutral-500">{data.addonNote}</p>}
    </div>
  );
}
