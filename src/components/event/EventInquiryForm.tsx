import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { BookEventData, SiteData } from "../../types";
import {
  buildInquiryMessage,
  CONTACT_FIELDS,
  EMPTY_INQUIRY,
  EVENT_FIELDS,
  formatEventDate,
  saveInquiry,
  todayIso,
  validateField,
} from "../../lib/event";
import type { EventField, EventInquiry } from "../../lib/event";
import { orderReference, whatsappLink } from "../../lib/commission";
import { track } from "../../lib/analytics";
import WhatsAppIcon from "../layout/WhatsAppIcon";

interface Props {
  data: BookEventData;
  site: SiteData;
}

type Stage = "event" | "contact" | "sent";
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
  options: string[];
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
            key={option}
            className="cursor-pointer rounded-full bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 ring-1 ring-pink-200 transition-colors hover:bg-pink-50 has-checked:bg-pink-600 has-checked:text-white has-checked:ring-pink-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-pink-500"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}

/**
 * Two short parts. The event comes first — four questions, three of them taps —
 * because they are easy and low-commitment; contact details are asked only once
 * the visitor is invested. On send, the inquiry is stored with Netlify Forms and
 * handed to WhatsApp, so a lead is never lost to an unsent chat.
 */
export default function EventInquiryForm({ data, site }: Props) {
  const [stage, setStage] = useState<Stage>("event");
  const [inquiry, setInquiry] = useState<EventInquiry>(EMPTY_INQUIRY);
  const [errors, setErrors] = useState<Errors>({});
  const [reference] = useState(() => orderReference("EVT"));
  const started = useRef(false);
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the new part's heading so keyboard and screen-reader users land
  // at the top of it — but not on page load, which would steal the scroll.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stageHeading.current?.focus();
  }, [stage]);

  const set = (field: EventField, value: string) => {
    if (!started.current) {
      started.current = true;
      track("event_inquiry_started", { first_field: field });
    }
    const next = { ...inquiry, [field]: value };
    setInquiry(next);
    // Clear an error the moment it's fixed; new errors wait for blur or Continue.
    if (errors[field] && !validateField(field, next)) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const blur = (field: EventField) => {
    if (!inquiry[field].trim()) return; // An untouched empty field isn't an error yet.
    setErrors((prev) => ({ ...prev, [field]: validateField(field, inquiry) ?? undefined }));
  };

  /** Validates a whole part, shows every problem, and focuses the first one. */
  const check = (fields: EventField[]): boolean => {
    const found: Errors = {};
    for (const field of fields) {
      const message = validateField(field, inquiry);
      if (message) found[field] = message;
    }
    setErrors((prev) => ({ ...prev, ...found }));
    const first = fields.find((f) => found[f]);
    if (first) document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    return !first;
  };

  const continueToContact = (e: FormEvent) => {
    e.preventDefault();
    if (!check(EVENT_FIELDS)) return;
    setStage("contact");
    track("event_inquiry_step2", { event_type: inquiry.eventType, guests: inquiry.guests });
  };

  const message = buildInquiryMessage(data, inquiry, reference);
  const href = whatsappLink(site.whatsappNumber, message);

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!check(CONTACT_FIELDS)) return;

    const honeypot = new FormData(e.currentTarget).get("bot-field");
    if (!honeypot) saveInquiry(inquiry, reference);

    track("event_inquiry_submitted", { event_type: inquiry.eventType, guests: inquiry.guests, reference });

    // Opened inside the submit handler so it counts as the visitor's own tap and
    // isn't popup-blocked. If it is blocked anyway, take over this tab instead.
    const win = window.open(href, "_blank");
    if (win) win.opener = null;
    else window.location.href = href;

    setStage("sent");
  };

  if (stage === "sent") {
    const firstName = inquiry.name.trim().split(/\s+/)[0] ?? "";
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pink-100 sm:p-8" role="status">
        <h2 ref={stageHeading} tabIndex={-1} className="text-2xl font-extrabold text-neutral-900 outline-none">
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
            onClick={() => setStage("contact")}
            className="text-sm font-semibold text-neutral-600 underline underline-offset-4 hover:text-pink-600"
          >
            Edit my details
          </button>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">Inquiry ref {reference}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pink-100 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-pink-600">
        Step {stage === "event" ? 1 : 2} of 2
      </p>

      {stage === "event" ? (
        <form noValidate onSubmit={continueToContact}>
          <h2 ref={stageHeading} tabIndex={-1} className="mt-1 text-xl font-extrabold text-neutral-900 outline-none sm:text-2xl">
            {data.eventStepTitle}
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <label htmlFor="event-date" className="text-sm font-semibold text-neutral-800">
                Event date
              </label>
              <input
                id="event-date"
                name="date"
                type="date"
                min={todayIso()}
                value={inquiry.date}
                onChange={(e) => set("date", e.target.value)}
                onBlur={() => blur("date")}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "date-error" : undefined}
                className={`${inputClass} ${errors.date ? "border-red-400" : "border-pink-200"}`}
              />
              <FieldError id="date-error" message={errors.date} />
            </div>

            <ChipGroup
              name="eventType"
              legend="Kind of event"
              options={data.eventTypes}
              value={inquiry.eventType}
              error={errors.eventType}
              onChange={(v) => set("eventType", v)}
            />

            <ChipGroup
              name="guests"
              legend="Number of guests"
              options={data.guestRanges}
              value={inquiry.guests}
              error={errors.guests}
              onChange={(v) => set("guests", v)}
            />

            <div>
              <label htmlFor="event-location" className="text-sm font-semibold text-neutral-800">
                Area or venue
              </label>
              <p id="location-hint" className="text-xs text-neutral-500">
                e.g. Lekki, Ikeja, or the venue name
              </p>
              <input
                id="event-location"
                name="location"
                type="text"
                autoComplete="off"
                value={inquiry.location}
                onChange={(e) => set("location", e.target.value)}
                onBlur={() => blur("location")}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? "location-hint location-error" : "location-hint"}
                className={`${inputClass} ${errors.location ? "border-red-400" : "border-pink-200"}`}
              />
              <FieldError id="location-error" message={errors.location} />
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-7 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-pink-700 sm:w-auto"
          >
            {data.checkAvailabilityLabel}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : (
        <form noValidate onSubmit={send}>
          <h2 ref={stageHeading} tabIndex={-1} className="mt-1 text-xl font-extrabold text-neutral-900 outline-none sm:text-2xl">
            {data.contactStepTitle}
          </h2>
          {data.contactStepHint && <p className="mt-1 text-sm text-neutral-600">{data.contactStepHint}</p>}

          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-pink-50 px-4 py-3 text-sm text-neutral-700">
            <p>
              <span className="font-bold text-neutral-900">{inquiry.eventType}</span> · {formatEventDate(inquiry.date)} ·{" "}
              {inquiry.guests} guests · {inquiry.location.trim()}
            </p>
            <button
              type="button"
              onClick={() => setStage("event")}
              className="shrink-0 font-semibold text-pink-700 underline underline-offset-4"
            >
              Edit
            </button>
          </div>

          {/* Honeypot: hidden from people, filled in by bots, checked before saving. */}
          <p className="hidden" aria-hidden="true">
            <label>
              Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="event-name" className="text-sm font-semibold text-neutral-800">
                Your name
              </label>
              <input
                id="event-name"
                name="name"
                type="text"
                autoComplete="name"
                value={inquiry.name}
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
                value={inquiry.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={() => blur("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={`${inputClass} ${errors.phone ? "border-red-400" : "border-pink-200"}`}
              />
              <FieldError id="phone-error" message={errors.phone} />
            </div>

            <div>
              <label htmlFor="event-notes" className="text-sm font-semibold text-neutral-800">
                Anything else we should know? <span className="font-normal text-neutral-500">(optional)</span>
              </label>
              <p id="notes-hint" className="text-xs text-neutral-500">
                Start time, how many hours, the theme…
              </p>
              <textarea
                id="event-notes"
                name="notes"
                rows={3}
                value={inquiry.notes}
                onChange={(e) => set("notes", e.target.value)}
                aria-describedby="notes-hint"
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
      )}
    </div>
  );
}
