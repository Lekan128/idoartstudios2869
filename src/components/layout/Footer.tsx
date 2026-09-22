import siteData from "../../data/site.json";
import type { SiteData } from "../../types";
import ClientLogos from "./ClientLogos";

const site = siteData as SiteData;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-pink-100 bg-white">
      <ClientLogos />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center font-serif text-lg italic text-neutral-800">
          — {site.footerTagline} —
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-pink-100 pt-8 text-sm text-neutral-600 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <img src={site.logo} alt={site.brandName} className="h-8 w-auto" />
          </div>

          <div className="flex flex-col items-center gap-1 sm:items-end">
            {site.contactEmail && (
              <a href={`mailto:${site.contactEmail}`} className="hover:text-pink-600">
                {site.contactEmail}
              </a>
            )}
            {site.whatsappNumber && (
              <a
                href={`https://wa.me/${site.whatsappNumber.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600"
              >
                WhatsApp: {site.whatsappNumber}
              </a>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          © {year} {site.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
