import type { EventBookingData, EventPlan } from "../types";
import { formatPrice } from "./commission";

/** Everything a coordinator tells us about their event. Empty string = not answered yet. */
export interface EventInquiry {
  plan: string; // a plan id, or NOT_SURE
  length: BookingLength;
  date: string; // yyyy-mm-dd, straight from <input type="date">
  eventType: string;
  location: string;
  name: string;
  phone: string;
  notes: string;
}

export const EMPTY_INQUIRY: EventInquiry = {
  plan: "",
  length: "full",
  date: "",
  eventType: "",
  location: "",
  name: "",
  phone: "",
  notes: "",
};

/** How long they want us for: the whole event, or the shorter hourly booking. */
export type BookingLength = "full" | "hourly";

/** The plan value for "Not sure yet" — always a valid answer, so it never blocks a booking. */
export const NOT_SURE = "not-sure";

/** The Netlify form this is stored under — must match the hidden form in index.html. */
export const NETLIFY_FORM_NAME = "event-inquiry";

export type EventField = keyof EventInquiry;

/** Required fields, in the order they appear — the first one with an error gets focus. */
export const REQUIRED_FIELDS: EventField[] = ["plan", "date", "eventType", "location", "name", "phone"];

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

/** "Classic" from "Classic Experience" — for chips and buttons where space is tight. */
export function shortPlanName(plan: EventPlan): string {
  return plan.name.replace(/\s+experience$/i, "");
}

/** "₦300,000", or "On request" for a rate without a price yet. */
export function formatRate(data: EventBookingData, price: number): string {
  return price > 0 ? formatPrice(price, data.currency) : "On request";
}

/** "Per hour" for an hourly rate, "2 hours" for a fixed short package. */
export function hourlyLabel(plan: EventPlan): string {
  return plan.hourly.unit === "hour" ? "Per hour" : `${plan.hourly.hours} hours`;
}

/** The two rates as the plan cards list them: the price as quoted, with its small print. */
export function cardRates(plan: EventPlan): { label: string; price: number; note: string }[] {
  const { fullEvent, hourly } = plan;
  const hourlyNote = hourly.note || (hourly.unit === "hour" ? `Minimum ${hourly.hours} hours` : "");
  return [
    { label: "Full event", price: fullEvent.price, note: fullEvent.note },
    { label: hourlyLabel(plan), price: hourly.price, note: hourlyNote },
  ];
}

/**
 * What the chosen booking costs, as the form shows it: the full-event price, or
 * the shortest hourly booking worked out in full (e.g. 2 hours at ₦500,000/hr).
 */
export function bookingQuote(data: EventBookingData, plan: EventPlan, length: BookingLength): { price: number; detail: string } {
  if (length === "full") {
    return { price: plan.fullEvent.price, detail: plan.fullEvent.note || "For the whole event" };
  }
  const { price, unit, hours, note } = plan.hourly;
  if (unit === "hour") {
    return {
      price: price * hours,
      detail: [`${hours} hours at ${formatRate(data, price)}/hr`, note].filter(Boolean).join(" · "),
    };
  }
  return { price, detail: [`${hours} hours`, note].filter(Boolean).join(" · ") };
}

/** "Full event — ₦1,800,000" or "2 hours — ₦1,000,000 (₦500,000/hr)", for WhatsApp and the inbox. */
export function bookingLabel(data: EventBookingData, inquiry: EventInquiry): string {
  const plan = data.plans.find((p) => p.id === inquiry.plan);
  if (!plan) return inquiry.length === "full" ? "Full event" : "Hourly";
  const { price } = bookingQuote(data, plan, inquiry.length);
  if (inquiry.length === "full") return `Full event — ${formatRate(data, price)}`;
  const { hours, unit } = plan.hourly;
  const rate = unit === "hour" ? ` (${formatRate(data, plan.hourly.price)}/hr)` : "";
  return `${hours} hours — ${formatRate(data, price)}${rate}`;
}

/**
 * One message per field, written as what to do rather than what went wrong.
 * Returns null when the field is fine.
 */
export function validateField(field: EventField, inquiry: EventInquiry): string | null {
  const value = inquiry[field].trim();
  switch (field) {
    case "plan":
      return value ? null : "Choose an experience — or “Not sure yet”.";
    case "date":
      if (!value) return "Choose the date of your event.";
      if (value < todayIso()) return "That date has passed — choose an upcoming date.";
      return null;
    case "eventType":
      return value ? null : "Choose the kind of event.";
    case "location":
      return value ? null : "Tell us the area or venue, e.g. Lekki or Eko Hotel.";
    case "name":
      return value ? null : "Tell us your name so we know who to ask for.";
    case "phone": {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Add your WhatsApp number so we can reply.";
      if (digits.length < 10 || digits.length > 15) return "Check the number — include every digit, e.g. 0803 123 4567.";
      return null;
    }
    default:
      return null;
  }
}

/** The plan as the owner should read it in WhatsApp and the Netlify inbox. */
export function planLabel(data: EventBookingData, planId: string): string {
  if (planId === NOT_SURE) return data.notSureLabel;
  return data.plans.find((p) => p.id === planId)?.name ?? planId;
}

/** Builds the plain-text request that gets pre-filled into WhatsApp. */
export function buildInquiryMessage(data: EventBookingData, inquiry: EventInquiry, reference: string): string {
  const parts = [
    data.whatsappIntro,
    "",
    `Experience: ${planLabel(data, inquiry.plan)}`,
    ...(inquiry.plan && inquiry.plan !== NOT_SURE ? [`Booking: ${bookingLabel(data, inquiry)}`] : []),
    `Event: ${inquiry.eventType}`,
    `Date: ${formatEventDate(inquiry.date)}`,
    `Location: ${inquiry.location.trim()}`,
    "",
    `Name: ${inquiry.name.trim()}`,
    `WhatsApp: ${inquiry.phone.trim()}`,
  ];
  if (inquiry.notes.trim()) parts.push("", `Note: ${inquiry.notes.trim()}`);
  parts.push("", `Booking ref: ${reference}`);
  return parts.join("\n");
}

/**
 * Stores the request with Netlify Forms, so the lead exists (and the owner is
 * emailed) even if the visitor never presses Send in WhatsApp. Fire-and-forget:
 * `keepalive` lets the request finish while WhatsApp takes over the screen, and a
 * failure here must never stop the WhatsApp hand-off.
 */
export function saveInquiry(data: EventBookingData, inquiry: EventInquiry, reference: string): void {
  try {
    const body = new URLSearchParams({
      "form-name": NETLIFY_FORM_NAME,
      reference,
      ...inquiry,
      plan: planLabel(data, inquiry.plan),
      length: inquiry.plan && inquiry.plan !== NOT_SURE ? bookingLabel(data, inquiry) : "",
    });
    void fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      keepalive: true,
    }).catch(() => {
      // Offline, or running locally without Netlify — WhatsApp still carries the request.
    });
  } catch {
    // Same as above.
  }
}
