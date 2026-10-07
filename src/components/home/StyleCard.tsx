import { Link } from "react-router-dom";
import type { CommissionSubject } from "../../types";

interface Props {
  subject: CommissionSubject;
}

/**
 * Homepage card for one thing we draw. It reads straight from the commission data
 * and deep-links into the ordering page with the option already chosen, where
 * the visitor lands on the style step and sees the prices.
 */
export default function StyleCard({ subject }: Props) {
  return (
    <div className="group flex flex-col items-center overflow-hidden rounded-2xl bg-white text-center shadow-sm ring-1 ring-pink-100 transition-shadow hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden border-b border-pink-100 bg-white">
        <img
          src={subject.image}
          alt={subject.alt || subject.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex w-full flex-1 flex-col items-center p-5 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-900">{subject.name}</h3>
        <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">{subject.tagline}</p>
        <p className="mt-2 flex-1 text-sm text-neutral-600">{subject.description}</p>

        <Link
          to={`/styles/?type=${subject.id}`}
          className="mt-4 block w-full rounded-full bg-pink-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-pink-700"
        >
          See styles &amp; prices →
        </Link>
      </div>
    </div>
  );
}
