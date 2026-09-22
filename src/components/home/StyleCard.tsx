import { Link } from "react-router-dom";
import type { StyleOption } from "../../types";

export default function StyleCard({ title, description, note, image, ctaLabel, ctaUrl }: StyleOption) {
  // The CTA can point at an in-app page (the style gallery) or an external
  // link like the booking form — route the two differently so internal links
  // don't cost a full page reload.
  const internal = ctaUrl.startsWith("/");
  const ctaClass =
    "mt-5 block w-full rounded-full bg-pink-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-pink-700";

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-pink-100">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-pink-50">
        <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>

      {internal ? (
        <Link to={ctaUrl} className={ctaClass}>
          {ctaLabel} →
        </Link>
      ) : (
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className={ctaClass}>
          {ctaLabel} →
        </a>
      )}

      <p className="mt-3 text-xs text-neutral-500">{note}</p>
    </div>
  );
}
