import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { EventBookingData, SiteData } from "../../types";
import {
  bookingQuote,
  buildInquiryMessage,
  EMPTY_INQUIRY,
  formatRate,
  hourlyLabel,
  NOT_SURE,
  REQUIRED_FIELDS,
  saveInquiry,
  shortPlanName,
  todayIso,
  validateField,
} from "../../lib/event";
import type { BookingLength, EventField, EventInquiry } from "../../lib/event";
import { orderReference, whatsappLink } from "../../lib/commission";
import { track } from "../../lib/analytics";
import WhatsAppIcon from "../layout/WhatsAppIcon";

interface Props {
  data: EventBookingData;
  site: SiteData;
  /** Chosen plan id (or NOT_SURE), shared with the plan cards above. */
  plan: string;
  onPlanChange: (plan: string) => void;
}

type Errors = Partial<Record<EventField, string>>;

const inputClass =
  "mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 outline-none transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-red-700">
      {message}
    </p>
  );
}

/** A single-choice question answered with one tap: real radio inputs, styled as chips. */
function ChipGroup({
  name,
  legend,
  options,
  value,
  error,
  onChange,
}: {
  name: EventField;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="text-sm font-semibold text-neutral-800">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="cursor-pointer rounded-full bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 ring-1 ring-pink-200 transition-colors hover:bg-pink-50 has-checked:bg-pink-600 has-checked:text-white has-checked:ring-pink-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-pink-500"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}

/**
 * One short form, one send button. The plan arrives already chosen from the
 * cards above (and can be changed right here), most answers are a tap, and only
 * three things are typed: the venue, a name and a WhatsApp number. On send, the
 * request is stored with Netlify Forms and handed to WhatsApp, so a lead is
 * never lost to an unsent chat.
 */
export default function EventInquiryForm({ data, site, plan, onPlanChange }: Props) {
  const [fields, setFields] = useState<Omit<EventInquiry, "plan">>(EMPTY_INQUIRY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [reference] = useState(() => orderReference("EVT"));
  const started = useRef(false);
  const sentHeading = useRef<HTMLHeadingElement>(null);

  const inquiry: EventInquiry = { ...fields, plan };
  const chosen = data.plans.find((p) => p.id === plan);
  const quote = chosen ? bookingQuote(data, chosen, fields.length) : null;

  const markStarted = (field: EventField) => {
    if (started.current) return;
    started.current = true;
    track("event_inquiry_started", { first_field: field, plan });
  };

  const setLength = (length: BookingLength) => {
    markStarted("length");
    setFields((prev) => ({ ...prev, length }));
    track("event_booking_length_selected", { plan, length });
  };

  const set = (field: Exclude<EventField, "plan" | "length">, value: string) => {
    markStarted(field);
    const next = { ...fields, [field]: value };
    setFields(next);
    // Clear an error the moment it's fixed; new errors wait for blur or Send.
    if (errors[field] && !validateField(field, { ...next, plan })) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const choosePlan = (value: string) => {
    markStarted("plan");
    onPlanChange(value);
    setErrors((prev) => ({ ...prev, plan: undefined }));
  };

  const blur = (field: EventField) => {
    if (!inquiry[field].trim()) return; // An untouched empty field isn't an error yet.
    setErrors((prev) => ({ ...prev, [field]: validateField(field, inquiry) ?? undefined }));
  };

  const message = buildInquiryMessage(data, inquiry, reference);
  const href = whatsappLink(site.whatsappNumber, message);

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const found: Errors = {};
    for (const field of REQUIRED_FIELDS) {
      const problem = validateField(field, inquiry);
      if (problem) found[field] = problem;
    }
    setErrors(found);
    const first = REQUIRED_FIELDS.find((f) => found[f]);
    if (first) {
      document.querySelector<HTMLElement>(`#event-booking [name="${first}"]`)?.focus();
      return;
    }

    const honeypot = new FormData(e.currentTarget).get("bot-field");
    if (!honeypot) saveInquiry(data, inquiry, reference);

    track("event_inquiry_submitted", { plan, event_type: inquiry.eventType, reference });

    // Opened inside the submit handler so it counts as the visitor's own tap and
    // isn't popup-blocked. If it is blocked anyway, take over this tab instead.
    const win = window.open(href, "_blank");
    if (win) win.opener = null;
    else window.location.assign(href);

    setSent(true);
    requestAnimationFrame(() => sentHeading.current?.focus());
  };

  if (sent) {
    const firstName = inquiry.name.trim().split(/\s+/)[0] ?? "";
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pink-100 sm:p-8" role="status">
        <h2 ref={sentHeading} tabIndex={-1} className="text-2xl font-extrabold text-neutral-900 outline-none">
          {data.sentTitle.replace("{name}", firstName)}
        </h2>
        <p className="mt-3 text-neutral-700">{data.sentBody}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-pink-700 ring-2 ring-inset ring-pink-300 transition-colors hover:bg-pink-50"
          >
            WhatsApp didn't open? Open it again
            <WhatsAppIcon />
          </a>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm font-semibold text-neutral-600 underline underline-offset-4 hover:text-pink-600"
          >
            Edit my details
          </button>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">Booking ref {reference}</p>
      </div>
    );
  }

  const planOptions = [
    ...data.plans.map((p) => ({ value: p.id, label: shortPlanName(p) })),
    { value: NOT_SURE, label: data.notSureLabel },
  ];

  return (
    <form noValidate onSubmit={send} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pink-100 sm:p-8">
      <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
        {chosen ? data.formTitleWithPlan.replace("{plan}", chosen.name) : data.formTitle}
      </h2>
      {data.formHint && <p className="mt-1 text-sm text-neutral-600">{data.formHint}</p>}

      {/* Honeypot: hidden from people, filled in by bots, checked before saving. */}
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="mt-6 space-y-6">
        <ChipGroup
          name="plan"
          legend="Experience"
          options={planOptions}
          value={plan}
          error={errors.plan}
          onChange={choosePlan}
        />

        {/* Full event or the shorter hourly booking, with the price for the choice
            worked out underneath — so the figure in WhatsApp is never a surprise. */}
        {chosen && (
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-800">How long?</legend>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-pink-50 p-1 ring-1 ring-pink-200">
              {(["full", "hourly"] as const).map((length) => (
                <label
                  key={length}
                  className="cursor-pointer rounded-full px-3 py-2.5 text-center text-sm font-bold text-neutral-600 transition-colors hover:text-pink-700 has-checked:bg-pink-600 has-checked:text-white has-checked:shadow has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-pink-500"
                >
                  <input
                    type="radio"
                    name="length"
                    value={length}
                    checked={fields.length === length}
                    onChange={() => setLength(length)}
                    className="sr-only"
                  />
                  {length === "full" ? "Full event" : hourlyLabel(chosen)}
                </label>
              ))}
            </div>
            {quote && (
              <p
                aria-live="polite"
                className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl bg-pink-50 px-4 py-3"
              >
                <span className="text-sm text-neutral-600">{quote.detail}</span>
                <span className="whitespace-nowrap text-xl font-extrabold text-neutral-900">
                  {formatRate(data, quote.price)}
                </span>
              </p>
            )}
          </fieldset>
        )}

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
          <div>
            <label htmlFor="event-date" className="text-sm font-semibold text-neutral-800">
              Event date
            </label>
            <input
              id="event-date"
              name="date"
              type="date"
              min={todayIso()}
              value={fields.date}
              onChange={(e) => set("date", e.target.value)}
              onBlur={() => blur("date")}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "date-error" : undefined}
              className={`${inputClass} ${errors.date ? "border-red-400" : "border-pink-200"}`}
            />
            <FieldError id="date-error" message={errors.date} />
          </div>

          <div>
            <label htmlFor="event-location" className="text-sm font-semibold text-neutral-800">
              Area or venue
            </label>
            <input
              id="event-location"
              name="location"
              type="text"
              autoComplete="off"
              placeholder="e.g. Lekki, or the venue name"
              value={fields.location}
              onChange={(e) => set("location", e.target.value)}
              onBlur={() => blur("location")}
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? "location-error" : undefined}
              className={`${inputClass} ${errors.location ? "border-red-400" : "border-pink-200"}`}
            />
            <FieldError id="location-error" message={errors.location} />
          </div>
        </div>

        <ChipGroup
          name="eventType"
          legend="Kind of event"
          options={data.eventTypes.map((t) => ({ value: t, label: t }))}
          value={fields.eventType}
          error={errors.eventType}
          onChange={(v) => set("eventType", v)}
        />

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
          <div>
            <label htmlFor="event-name" className="text-sm font-semibold text-neutral-800">
              Your name
            </label>
            <input
              id="event-name"
              name="name"
              type="text"
              autoComplete="name"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => blur("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`${inputClass} ${errors.name ? "border-red-400" : "border-pink-200"}`}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div>
            <label htmlFor="event-phone" className="text-sm font-semibold text-neutral-800">
              WhatsApp number
            </label>
            <input
              id="event-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={fields.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => blur("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={`${inputClass} ${errors.phone ? "border-red-400" : "border-pink-200"}`}
            />
            <FieldError id="phone-error" message={errors.phone} />
          </div>
        </div>

        <div>
          <label htmlFor="event-notes" className="text-sm font-semibold text-neutral-800">
            Anything else we should know? <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <textarea
            id="event-notes"
            name="notes"
            rows={2}
            placeholder="Start time, how many hours, the theme…"
            value={fields.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={`${inputClass} border-pink-200`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-7 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-pink-700 sm:w-auto"
      >
        {data.sendLabel}
        <WhatsAppIcon />
      </button>
      {data.sendHint && <p className="mt-2 text-xs text-neutral-500">{data.sendHint}</p>}
    </form>
  );
}
