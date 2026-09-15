import type { StyleOption } from "../../types";

export default function StyleCard({ title, description, note, image, ctaLabel, ctaUrl }: StyleOption) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-pink-100">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-pink-50">
        <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>

      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 w-full rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
      >
        {ctaLabel} →
      </a>

      <p className="mt-3 text-xs text-neutral-500">{note}</p>
    </div>
  );
}
