import { Link } from "react-router-dom";
import type { CommissionSubject } from "../../types";
import { formatPrice } from "../../lib/commission";

interface Props {
  subject: CommissionSubject;
  from: number | null;
  currency: string;
  fromLabel: string;
}

/**
 * Homepage card for one thing we draw. It reads straight from the commission data
 * so the price shown here can never drift from the price on the ordering page,
 * and it deep-links into that page with the option already chosen.
 */
export default function StyleCard({ subject, from, currency, fromLabel }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-pink-100">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-pink-50">
        <img
          src={subject.image}
          alt={subject.alt || subject.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <h3 className="mt-5 text-lg font-bold text-neutral-900">{subject.name}</h3>
      <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">{subject.tagline}</p>
      <p className="mt-2 flex-1 text-sm text-neutral-600">{subject.description}</p>

      {from !== null && (
        <p className="mt-4 text-sm font-bold text-neutral-900">
          <span className="font-normal text-neutral-500">{fromLabel} </span>
          {formatPrice(from, currency)}
        </p>
      )}

      <Link
        to={`/styles/?type=${subject.id}`}
        className="mt-4 block w-full rounded-full bg-pink-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-pink-700"
      >
        See styles &amp; prices →
      </Link>
    </div>
  );
}
