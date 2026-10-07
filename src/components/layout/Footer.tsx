import siteData from "../../data/site.json";
import type { SiteData } from "../../types";
import ClientLogos from "./ClientLogos";
import { InstagramIcon, MailIcon, PhoneIcon } from "./ContactIcons";
import { formatPhone, instagramHandle, telLink } from "../../lib/contact";

const site = siteData as SiteData;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-pink-100 bg-white">
      <ClientLogos />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-10">
        <div className="grid items-center gap-5 border-t border-pink-100 pt-8 text-center text-sm text-neutral-600 md:grid-cols-3 md:text-left">
          <img src={site.logo} alt={site.brandName} className="mx-auto h-16 w-auto md:mx-0" />

          <p className="font-display text-lg font-medium text-neutral-800 md:text-center">{site.footerTagline}</p>

          <ul className="flex flex-col items-center gap-2 md:items-end">
            {site.whatsappNumber && (
              <li>
                <a href={telLink(site)} className="inline-flex items-center gap-2 hover:text-pink-600">
                  <PhoneIcon size={15} className="text-pink-600" />
                  {formatPhone(site.whatsappNumber)}
                </a>
              </li>
            )}
            {site.contactEmail && (
              <li>
                <a href={`mailto:${site.contactEmail}`} className="inline-flex items-center gap-2 hover:text-pink-600">
                  <MailIcon size={15} className="text-pink-600" />
                  {site.contactEmail}
                </a>
              </li>
            )}
            {site.instagramUrl && (
              <li>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-pink-600"
                >
                  <InstagramIcon size={15} className="text-pink-600" />
                  {instagramHandle(site.instagramUrl)}
                </a>
              </li>
            )}
          </ul>
        </div>

        <p className="mt-8 text-center text-xs text-neutral-400">
          © {year} {site.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
