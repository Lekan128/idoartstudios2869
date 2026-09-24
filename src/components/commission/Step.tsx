import type { ReactNode } from "react";

interface Props {
  id: string;
  index: number;
  title: string;
  hint?: string;
  /** Shown on the right of the header once the step has been answered. */
  answer?: string;
  children: ReactNode;
}

/**
 * One numbered step of the ordering flow. Steps only render once the step above
 * them is answered, so the page stays a short, obvious sequence on a phone while
 * still being one continuously scrollable page (prices stay readable and indexable).
 */
export default function Step({ id, index, title, hint, answer, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-pink-100 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-title`} className="flex items-center gap-3 text-xl font-extrabold text-neutral-900 sm:text-2xl">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-600 font-sans text-sm font-bold text-white"
          >
            {index}
          </span>
          {title}
        </h2>
        {answer && <span className="text-sm font-semibold text-pink-600">{answer}</span>}
      </div>

      {hint && <p className="mt-2 max-w-2xl text-sm text-neutral-600">{hint}</p>}

      <div className="mt-5">{children}</div>
    </section>
  );
}
