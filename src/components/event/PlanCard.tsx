import type { EventBookingData, EventPlan } from "../../types";
import { cardRates, formatRate, shortPlanName } from "../../lib/event";
import PlanPhotos from "./PlanPhotos";
import PeopleIcon from "./PeopleIcon";

/** How many inclusions the card lists before "See all". */
const PREVIEW = 3;

interface Props {
  data: EventBookingData;
  plan: EventPlan;
  selected: boolean;
  /** Delay before this card's photos start rotating, so cards don't all change at once. */
  stagger: number;
  /** Holds the photos still, e.g. while the details view is open. */
  photosPaused: boolean;
  onChoose: () => void;
  /** Opens the plan's details view, on the given photo. */
  onOpenDetails: (photo: number) => void;
}

/**
 * One event experience: example photos from real events, the name, one line,
 * its rates (full event, per hour…), how many guests it serves and a taste of
 * what's included — enough to compare at a glance. The full description and
 * list are one tap away in the details view. A compact row on phones (rates,
 * capacity and the details link only) so all four plans stay a short scroll; a
 * full card from sm up. The choose button is outlined until picked, so at most
 * one filled button ever shows across the row.
 */
export default function PlanCard({ data, plan, selected, stagger, photosPaused, onChoose, onOpenDetails }: Props) {
  const features = plan.features ?? [];
  const hasDetails = Boolean(plan.description || features.length);
  return (
    <article
      className={`relative flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-shadow hover:shadow-md sm:flex-col ${
        selected ? "ring-2 ring-pink-500" : plan.badge ? "ring-pink-300" : "ring-pink-100"
      }`}
    >
      {plan.images?.length > 0 ? (
        <PlanPhotos
          images={plan.images}
          planName={plan.name}
          badge={plan.badge}
          stagger={stagger}
          paused={photosPaused}
          onOpen={onOpenDetails}
        />
      ) : (
        <div aria-hidden="true" className="w-2 shrink-0 bg-gradient-to-b from-pink-500 to-pink-300 sm:h-2 sm:w-full sm:bg-gradient-to-r" />
      )}

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-lg font-extrabold leading-tight text-neutral-900 sm:text-xl">{plan.name}</h3>
          {plan.badge && (
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-700 sm:hidden">
              {plan.badge}
            </span>
          )}
        </div>
        {plan.tagline && (
          <p className="mt-1 text-xs font-semibold uppercase leading-snug tracking-wide text-pink-600">{plan.tagline}</p>
        )}

        {plan.fullEvent && plan.hourly && (
          <dl className="mt-3 divide-y divide-pink-100 border-y border-pink-100 text-sm sm:mt-4">
            {cardRates(plan).map((rate, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 py-2">
                <dt className="text-neutral-600">
                  {rate.label}
                  {rate.note && <span className="block text-xs text-neutral-500">{rate.note}</span>}
                </dt>
                <dd className="whitespace-nowrap font-extrabold text-neutral-900">{formatRate(data, rate.price)}</dd>
              </div>
            ))}
          </dl>
        )}

        {plan.capacity && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
            <PeopleIcon size={14} className="shrink-0 text-pink-600" />
            {plan.capacity}
          </p>
        )}

        {features.length > 0 && (
          <div className="mt-4 hidden sm:block">
            {plan.includesIntro && <p className="text-xs font-semibold text-neutral-800">{plan.includesIntro}</p>}
            <ul className="mt-1.5 space-y-1.5 text-sm text-neutral-700">
              {features.slice(0, PREVIEW).map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="font-bold text-pink-600">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasDetails && (
          <button
            type="button"
            onClick={() => onOpenDetails(0)}
            className="mt-3 inline-flex items-center gap-1 self-start text-sm font-bold text-pink-700 underline-offset-4 hover:underline"
          >
            {features.length > PREVIEW ? `See all ${features.length} inclusions` : "See details"}
            <span aria-hidden="true">→</span>
          </button>
        )}

        {/* Pushes the button to the foot of the card, so buttons line up across the row. */}
        <div className="flex-1" />

        <button
          type="button"
          onClick={onChoose}
          aria-pressed={selected}
          className={`mt-4 w-full whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] font-bold transition-colors sm:mt-5 sm:py-3 ${
            selected
              ? "bg-pink-600 text-white shadow-md hover:bg-pink-700"
              : "text-pink-700 ring-2 ring-inset ring-pink-300 hover:bg-pink-50"
          }`}
        >
          {selected ? `✓ ${shortPlanName(plan)} chosen` : `Choose ${shortPlanName(plan)}`}
        </button>
      </div>
    </article>
  );
}
