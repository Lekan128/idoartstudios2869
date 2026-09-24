import { useState } from "react";
import type { CommissionData } from "../../types";
import { formatPrice, priceFor } from "../../lib/commission";

/** The three-step explainer. Answers "what actually happens after I tap order?". */
export function HowItWorks({ data }: { data: CommissionData }) {
  if (!data.howItWorks?.length) return null;

  return (
    <section className="border-t border-pink-100 pt-10">
      <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">{data.howItWorksTitle}</h2>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {data.howItWorks.map((step, i) => (
          <li key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
            <h3 className="text-base font-bold text-neutral-900">{step.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Turnaround, photos, revisions, payment. These are the four questions that stop a
 * purchase at this price point — left unanswered they become a closed tab, not a message.
 */
export function Assurances({ data }: { data: CommissionData }) {
  if (!data.assurances?.length) return null;

  return (
    <section className="border-t border-pink-100 pt-10">
      <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">{data.assuranceTitle}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {data.assurances.map((item, i) => (
          <div key={i} className="rounded-2xl bg-pink-50/70 p-5 ring-1 ring-pink-100">
            <h3 className="text-base font-bold text-neutral-900">{item.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The whole matrix as real HTML. Two jobs: it lets a price-shopper scan without
 * clicking through the flow, and it puts every figure somewhere Google can index —
 * which is what wins the "how much does a caricature cost" searches.
 */
export function PriceTable({ data }: { data: CommissionData }) {
  return (
    <section className="border-t border-pink-100 pt-10">
      <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">{data.priceTableTitle}</h2>

      <div className="mt-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[520px] border-collapse overflow-hidden rounded-2xl bg-white text-sm shadow-sm ring-1 ring-pink-100">
          <thead>
            <tr className="bg-pink-50">
              <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-900">
                Option
              </th>
              {data.styles.map((style) => (
                <th key={style.id} scope="col" className="px-4 py-3 text-right font-bold text-neutral-900">
                  {style.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((subject) => (
              <tr key={subject.id} className="border-t border-pink-100">
                <th scope="row" className="px-4 py-3 text-left font-semibold text-neutral-800">
                  {subject.name}
                </th>
                {data.styles.map((style) => {
                  const price = priceFor(data, subject.id, style.id);
                  return (
                    <td key={style.id} className="whitespace-nowrap px-4 py-3 text-right font-semibold text-neutral-900">
                      {price !== null ? formatPrice(price, data.currency) : data.onRequestLabel}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.priceTableNote && <p className="mt-3 text-xs text-neutral-500">{data.priceTableNote}</p>}
    </section>
  );
}

export function Faq({ data }: { data: CommissionData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!data.faqs?.length) return null;

  return (
    <section className="border-t border-pink-100 pt-10">
      <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">{data.faqTitle}</h2>

      <dl className="mt-5 divide-y divide-pink-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-pink-100">
        {data.faqs.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div key={i}>
              <dt>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  aria-controls={`faq-answer-${i}`}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-pink-50/60"
                >
                  <span className="text-sm font-bold text-neutral-900">{faq.question}</span>
                  <span aria-hidden="true" className="shrink-0 text-lg font-bold text-pink-600">
                    {open ? "−" : "+"}
                  </span>
                </button>
              </dt>
              {open && (
                <dd id={`faq-answer-${i}`} className="px-5 pb-4 text-sm text-neutral-600">
                  {faq.answer}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
