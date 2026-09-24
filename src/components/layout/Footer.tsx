import siteData from "../../data/site.json";
import type { SiteData } from "../../types";
import ClientLogos from "./ClientLogos";

const site = siteData as SiteData;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-pink-100 bg-white">
      <ClientLogos />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-10">
        <div className="grid items-center gap-5 border-t border-pink-100 pt-8 text-center text-sm text-neutral-600 md:grid-cols-3 md:text-left">
          <img src={site.logo} alt={site.brandName} className="mx-auto h-9 w-auto md:mx-0" />

          <p className="font-display text-lg font-medium text-neutral-800 md:text-center">{site.footerTagline}</p>

          <div className="flex flex-col items-center gap-1 md:items-end">
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

        <p className="mt-8 text-center text-xs text-neutral-400">
          © {year} {site.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
