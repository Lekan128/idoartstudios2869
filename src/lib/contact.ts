import type { SiteData } from "../types";

/** "+234 809 182 6948" from "+2348091826948" — Nigerian numbers grouped the way they're read aloud. */
export function formatPhone(number: string): string {
  const digits = number.replace(/\D/g, "");
  const ng = digits.match(/^234(\d{3})(\d{3})(\d{4})$/);
  return ng ? `+234 ${ng[1]} ${ng[2]} ${ng[3]}` : number;
}

/** "@idoartstudios" from the Instagram profile URL in the site settings. */
export function instagramHandle(url: string): string {
  const handle = url.replace(/\/+$/, "").split("/").pop() ?? "";
  return handle ? `@${handle.replace(/^@/, "")}` : "";
}

export function telLink(site: SiteData): string {
  return `tel:+${site.whatsappNumber.replace(/\D/g, "")}`;
}

export function whatsappChatLink(site: SiteData): string {
  return `https://wa.me/${site.whatsappNumber.replace(/\D/g, "")}`;
}
