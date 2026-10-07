import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  hint?: string;
  children: ReactNode;
}

/**
 * One part of the order form. Every part is visible from the start and already
 * answered with a default, so there is no sequence to follow and nothing to
 * unlock — the visitor only touches what they want to change.
 */
export default function Step({ id, title, hint, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-pink-100 pt-6 sm:pt-8">
      <h2 id={`${id}-title`} className="text-lg font-extrabold text-neutral-900 sm:text-2xl">
        {title}
      </h2>
      {hint && <p className="mt-1 max-w-2xl text-sm text-neutral-600">{hint}</p>}

      <div className="mt-4">{children}</div>
    </section>
  );
}
