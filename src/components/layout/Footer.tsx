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

      {/* One compact row from md up — tagline and copyright, then the direct lines —
          kept to the left so the bottom-right corner stays free for the floating
          WhatsApp and video buttons. On phones those buttons span the full width
          of the corner, so the extra bottom padding keeps them off the last line. */}
      <div className="mx-auto max-w-6xl px-4 pb-40 pt-5 sm:px-6 md:pb-6">
        <div className="flex flex-col items-center gap-4 border-t border-pink-100 pt-5 text-center text-sm text-neutral-600 md:flex-row md:items-center md:gap-12 md:text-left">
          <div>
            <p className="font-display text-base font-medium text-neutral-800">{site.footerTagline}</p>
            <p className="mt-1 text-xs text-neutral-400">
              © {year} {site.brandName}. All rights reserved.
            </p>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-start">
            {site.whatsappNumber && (
              <li>
                <a href={telLink(site)} className="inline-flex items-center gap-1.5 hover:text-pink-600">
                  <PhoneIcon size={15} className="text-pink-600" />
                  {formatPhone(site.whatsappNumber)}
                </a>
              </li>
            )}
            {site.contactEmail && (
              <li>
                <a href={`mailto:${site.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-pink-600">
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
                  className="inline-flex items-center gap-1.5 hover:text-pink-600"
                >
                  <InstagramIcon size={15} className="text-pink-600" />
                  {instagramHandle(site.instagramUrl)}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </footer>
  );
}
