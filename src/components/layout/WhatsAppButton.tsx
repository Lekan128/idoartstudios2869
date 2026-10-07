import { useLocation } from "react-router-dom";
import siteData from "../../data/site.json";
import type { SiteData } from "../../types";
import WhatsAppIcon from "./WhatsAppIcon";

const site = siteData as SiteData;

export default function WhatsAppButton() {
  const { pathname } = useLocation();

  if (!site.whatsappNumber) return null;
  // Both ordering pages end in WhatsApp already: /styles has its sticky order bar in
  // this corner, and on the event page the button would sit over the booking form.
  const path = pathname.replace(/\/$/, "");
  if (path === "/styles" || path === "/spot-on-caricature") return null;
  const digits = site.whatsappNumber.replace(/[^\d]/g, "");

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
