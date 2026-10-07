import type { BookEventData } from "../types";

/** Everything a coordinator tells us about their event. Empty string = not answered yet. */
export interface EventInquiry {
  date: string; // yyyy-mm-dd, straight from <input type="date">
  eventType: string;
  guests: string;
  location: string;
  name: string;
  phone: string;
  notes: string;
}

export const EMPTY_INQUIRY: EventInquiry = {
  date: "",
  eventType: "",
  guests: "",
  location: "",
  name: "",
  phone: "",
  notes: "",
};

/** The Netlify form this is stored under — must match the hidden form in index.html. */
export const NETLIFY_FORM_NAME = "event-inquiry";

/** Today as yyyy-mm-dd in the visitor's own timezone (toISOString would use UTC). */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "Saturday, 14 November 2026". Parsed as a local date so it never shifts a day. */
export function formatEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type EventField = keyof EventInquiry;

/**
 * One message per field, written as what to do rather than what went wrong.
 * Returns null when the field is fine.
 */
export function validateField(field: EventField, inquiry: EventInquiry): string | null {
  const value = inquiry[field].trim();
  switch (field) {
    case "date":
      if (!value) return "Choose the date of your event.";
      if (value < todayIso()) return "That date has passed — choose an upcoming date.";
      return null;
    case "eventType":
      return value ? null : "Choose the kind of event.";
    case "guests":
      return value ? null : "Choose roughly how many guests.";
    case "location":
      return value ? null : "Tell us the area or venue, e.g. Lekki or Eko Hotel.";
    case "name":
      return value ? null : "Tell us your name so we know who to ask for.";
    case "phone": {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Add your WhatsApp number so we can send your quote.";
      if (digits.length < 10 || digits.length > 15) return "Check the number — include every digit, e.g. 0803 123 4567.";
      return null;
    }
    default:
      return null;
  }
}

export const EVENT_FIELDS: EventField[] = ["date", "eventType", "guests", "location"];
export const CONTACT_FIELDS: EventField[] = ["name", "phone"];

/** Builds the plain-text inquiry that gets pre-filled into WhatsApp. */
export function buildInquiryMessage(data: BookEventData, inquiry: EventInquiry, reference: string): string {
  const parts = [
    data.whatsappIntro,
    "",
    `Event: ${inquiry.eventType}`,
    `Date: ${formatEventDate(inquiry.date)}`,
    `Guests: ${inquiry.guests}`,
    `Location: ${inquiry.location.trim()}`,
    "",
    `Name: ${inquiry.name.trim()}`,
    `WhatsApp: ${inquiry.phone.trim()}`,
  ];
  if (inquiry.notes.trim()) parts.push("", `Note: ${inquiry.notes.trim()}`);
  parts.push("", `Inquiry ref: ${reference}`);
  return parts.join("\n");
}

/**
 * Stores the inquiry with Netlify Forms, so the lead exists (and the owner is
 * emailed) even if the visitor never presses Send in WhatsApp. Fire-and-forget:
 * `keepalive` lets the request finish while WhatsApp takes over the screen, and a
 * failure here must never stop the WhatsApp hand-off.
 */
export function saveInquiry(inquiry: EventInquiry, reference: string): void {
  try {
    const body = new URLSearchParams({
      "form-name": NETLIFY_FORM_NAME,
      reference,
      ...inquiry,
    });
    void fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      keepalive: true,
    }).catch(() => {
      // Offline, or running locally without Netlify — WhatsApp still carries the inquiry.
    });
  } catch {
    // Same as above.
  }
}
