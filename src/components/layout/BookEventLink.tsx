import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import siteData from "../../data/site.json";
import type { SiteData } from "../../types";
import { track } from "../../lib/analytics";

const site = siteData as SiteData;

interface Props {
  className: string;
  /** Where on the site the button sits, for the booking funnel. */
  placement: string;
  onClick?: () => void;
  children: ReactNode;
}

/**
 * Every "Book an Event" button. The link lives in the CMS: an on-site path stays
 * in the app (no new tab, no leaving the brand), while a full URL — e.g. a
 * fallback form — still opens externally.
 */
export default function BookEventLink({ className, placement, onClick, children }: Props) {
  const handleClick = () => {
    track("book_event_clicked", { placement });
    onClick?.();
  };

  if (site.bookEventUrl.startsWith("/")) {
    return (
      <Link to={site.bookEventUrl} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={site.bookEventUrl} target="_blank" rel="noopener noreferrer" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
