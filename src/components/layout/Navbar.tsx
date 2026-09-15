import { useState } from "react";
import { Link } from "react-router-dom";
import siteData from "../../data/site.json";
import type { SiteData } from "../../types";

const site = siteData as SiteData;

function NavItem({ href, className, onClick, children }: { href: string; className: string; onClick?: () => void; children: React.ReactNode }) {
  if (href.includes("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={site.logo} alt={site.brandName} className="h-10 w-auto sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-pink-600"
            >
              {item.label}
            </NavItem>
          ))}
        </nav>

        <a
          href={site.bookEventUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 md:inline-flex"
        >
          {site.bookEventLabel}
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-pink-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {site.nav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-neutral-700"
              >
                {item.label}
              </NavItem>
            ))}
            <a
              href={site.bookEventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-pink-600 px-5 py-2 text-center text-sm font-semibold text-white"
            >
              {site.bookEventLabel}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
