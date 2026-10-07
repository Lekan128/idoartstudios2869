import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import siteData from "../../data/site.json";
import type { SiteData } from "../../types";

const site = siteData as SiteData;

function NavItem({ href, className, onClick, children }: { href: string; className: string; onClick?: () => void; children: React.ReactNode }) {
  if (href.includes("#")) {
    return (
      <a href={href} className={`${className} text-neutral-700`} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <NavLink
      to={href}
      end
      className={({ isActive }) => `${className} ${isActive ? "text-pink-600" : "text-neutral-700"}`}
      onClick={onClick}
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // While the panel is open: Escape closes it, the page behind can't scroll, and
  // focus moves into the panel — then back to the menu button when it closes.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggleRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2" onClick={close}>
            <img src={site.logo} alt={site.brandName} className="h-12 w-auto sm:h-16" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {site.nav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                className="text-sm font-semibold transition-colors hover:text-pink-600"
              >
                {item.label}
              </NavItem>
            ))}
          </nav>

          <a
            href={site.bookEventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 lg:inline-flex"
          >
            {site.bookEventLabel}
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Side panel. Kept outside the header: its backdrop-blur would otherwise
          trap these fixed layers inside the header's box. Always mounted so it can
          slide both ways; `inert` takes it out of the tab order while closed. */}
      <div className="lg:hidden" inert={!open}>
        <div
          aria-hidden="true"
          onClick={close}
          className={`fixed inset-0 z-[70] bg-neutral-900/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`fixed inset-y-0 right-0 z-[70] flex w-[80vw] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3">
            <Link to="/" onClick={close}>
              <img src={site.logo} alt={site.brandName} className="h-10 w-auto" />
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 hover:bg-pink-50"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
            {site.nav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-pink-50"
              >
                {item.label}
              </NavItem>
            ))}
          </nav>

          <div className="border-t border-pink-100 p-4">
            <a
              href={site.bookEventUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="block rounded-full bg-pink-600 px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-pink-700"
            >
              {site.bookEventLabel}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
