import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import contactData from "../data/contact.json";
import siteData from "../data/site.json";
import type { ContactCard, ContactData, SiteData } from "../types";
import BookEventLink from "../components/layout/BookEventLink";
import WhatsAppIcon from "../components/layout/WhatsAppIcon";
import { CalendarIcon, InstagramIcon, MailIcon, PenIcon, PhoneIcon } from "../components/layout/ContactIcons";
import { formatPhone, instagramHandle, telLink, whatsappChatLink } from "../lib/contact";
import { track } from "../lib/analytics";

const page = contactData as ContactData;
const site = siteData as SiteData;

/** Tailwind needs whole class names, so the column count is picked from a fixed list. */
const COLUMNS: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" };

function ChoiceCard({ card, icon, children }: { card: ContactCard; icon: ReactNode; children: ReactNode }) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-pink-100 sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600 ring-1 ring-pink-100">
        {icon}
      </span>
      <h2 className="mt-5 text-2xl font-extrabold text-neutral-900">{card.title}</h2>
      <p className="mt-2 flex-1 text-sm text-neutral-600 sm:text-base">{card.body}</p>
      <div className="mt-6">{children}</div>
    </article>
  );
}

interface Channel {
  key: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
  extra?: ReactNode;
}

/**
 * Contact & Book: the two ways to work with us side by side — events first and
 * filled, since they're the bigger part of the business; commissions outlined —
 * then the direct lines, each one tap from a call, an email or the Instagram feed.
 */
export default function Contact() {
  useEffect(() => {
    document.title = page.seoTitle;
  }, []);

  const channels: Channel[] = [];
  if (site.whatsappNumber) {
    channels.push({
      key: "phone",
      label: "Phone & WhatsApp",
      value: formatPhone(site.whatsappNumber),
      href: telLink(site),
      icon: <PhoneIcon />,
      extra: (
        <a
          href={whatsappChatLink(site)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("contact_whatsapp_clicked")}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 underline-offset-4 hover:underline"
        >
          <WhatsAppIcon size={14} />
          Chat on WhatsApp
        </a>
      ),
    });
  }
  if (site.contactEmail) {
    channels.push({
      key: "email",
      label: "Email",
      value: site.contactEmail,
      href: `mailto:${site.contactEmail}`,
      icon: <MailIcon />,
    });
  }
  if (site.instagramUrl) {
    channels.push({
      key: "instagram",
      label: "Instagram",
      value: instagramHandle(site.instagramUrl),
      href: site.instagramUrl,
      external: true,
      icon: <InstagramIcon />,
    });
  }

  return (
    <div className="bg-pink-50/40">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-pink-600">{page.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl lg:text-5xl">{page.heading}</h1>
          {page.intro && <p className="mt-3 text-sm text-neutral-600 sm:text-base">{page.intro}</p>}
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          <ChoiceCard card={page.eventCard} icon={<CalendarIcon size={20} />}>
            <BookEventLink
              placement="contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-7 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-pink-700 sm:w-auto"
            >
              {site.bookEventLabel}
              <span aria-hidden="true">→</span>
            </BookEventLink>
          </ChoiceCard>

          <ChoiceCard card={page.commissionCard} icon={<PenIcon size={20} />}>
            <Link
              to="/styles/"
              onClick={() => track("contact_commission_clicked")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-pink-700 ring-2 ring-inset ring-pink-300 transition-colors hover:bg-pink-50 sm:w-auto"
            >
              {page.commissionCard.buttonLabel || page.commissionCard.title}
              <span aria-hidden="true">→</span>
            </Link>
          </ChoiceCard>
        </div>

        {channels.length > 0 && (
          <section aria-labelledby="direct-title" className="mt-10 rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-pink-100 sm:mt-12 sm:px-10 sm:py-10">
            <h2 id="direct-title" className="text-center text-xs font-bold uppercase tracking-widest text-pink-600">
              {page.directTitle}
            </h2>

            <ul
              className={`mt-8 grid gap-8 sm:gap-0 sm:divide-x sm:divide-pink-100 ${COLUMNS[channels.length] ?? "sm:grid-cols-3"}`}
            >
              {channels.map((c) => (
                <li key={c.key} className="flex flex-col items-center text-center sm:px-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600 ring-1 ring-pink-100">
                    {c.icon}
                  </span>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">{c.label}</p>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => track("contact_channel_clicked", { channel: c.key })}
                    className="mt-1 font-display [overflow-wrap:anywhere] text-lg font-bold text-neutral-900 transition-colors hover:text-pink-600 sm:text-xl"
                  >
                    {c.value}
                  </a>
                  {c.extra}
                </li>
              ))}
            </ul>

            {page.location && <p className="mt-8 text-center text-xs text-neutral-500">{page.location}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
