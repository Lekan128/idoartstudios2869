import { useState } from "react";
import type { StyleGalleryItem } from "../../types";
import { formatPrice } from "../../lib/order";

interface Props {
  item: StyleGalleryItem;
  currency: string;
  quoteLabel: string;
  quantity: number;
  onChange: (quantity: number) => void;
}

export default function StyleGalleryCard({ item, currency, quoteLabel, quantity, onChange }: Props) {
  const [active, setActive] = useState(0);
  const images = item.images ?? [];
  const cover = images[active] ?? images[0];
  const selected = quantity > 0;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all ${
        selected ? "ring-2 ring-pink-500" : "ring-pink-100"
      }`}
    >
      <div className="relative aspect-square w-full bg-pink-50">
        {cover && (
          <img
            src={cover.image}
            alt={cover.alt || item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {selected && (
          <span className="absolute left-3 top-3 rounded-full bg-pink-600 px-3 py-1 text-xs font-bold text-white shadow">
            {quantity} in order
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 pt-4">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${item.name}`}
              aria-current={i === active}
              className={`h-12 w-12 overflow-hidden rounded-lg ring-2 transition-all ${
                i === active ? "ring-pink-500" : "ring-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-neutral-900">{item.name}</h3>

        <p className="mt-1 text-xl font-extrabold text-pink-600">
          {item.price > 0 ? formatPrice(item.price, currency) : quoteLabel}
        </p>
        {item.priceNote && <p className="text-xs text-neutral-500">{item.priceNote}</p>}

        {item.description && <p className="mt-3 flex-1 text-sm text-neutral-600">{item.description}</p>}

        <div className="mt-5">
          {selected ? (
            <div className="flex items-center justify-between rounded-full bg-pink-50 p-1 ring-1 ring-pink-200">
              <button
                type="button"
                onClick={() => onChange(quantity - 1)}
                aria-label={`Remove one ${item.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-pink-600 shadow-sm hover:bg-pink-100"
              >
                −
              </button>
              <span className="text-sm font-bold text-neutral-800" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onChange(quantity + 1)}
                aria-label={`Add one more ${item.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-pink-600 shadow-sm hover:bg-pink-100"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onChange(1)}
              className="w-full rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
            >
              Add to order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
