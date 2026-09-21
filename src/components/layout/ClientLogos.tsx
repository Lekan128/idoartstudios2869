import clientsData from "../../data/clients.json";
import type { ClientsData } from "../../types";

const clients = clientsData as ClientsData;

function Logo({ name, logo, url }: { name: string; logo: string; url: string }) {
  const img = (
    <img
      src={logo}
      alt={name}
      title={name}
      // Not lazy: the marquee scrolls logos into view continuously, so deferred
      // ones pop in blank mid-animation. Low priority keeps them out of the way
      // of above-the-fold images instead.
      fetchPriority="low"
      // Uniform height + grayscale is what makes logos of wildly different
      // shapes and colours read as one consistent set. The box is a fixed size
      // with object-contain rather than `w-auto`: an SVG uploaded with only a
      // viewBox (no width/height) has no intrinsic size, and `w-auto` would
      // collapse it to zero width.
      className="h-10 w-[120px] object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-12 sm:w-[150px]"
    />
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center">
        {img}
      </a>
    );
  }
  return <span className="flex shrink-0 items-center">{img}</span>;
}

export default function ClientLogos() {
  const items = clients.items ?? [];
  if (items.length === 0) return null;

  return (
    <section aria-label={clients.title} className="border-t border-pink-100 bg-white py-10">
      <h2 className="text-center text-xs font-bold tracking-widest text-neutral-500 uppercase">
        {clients.title}
      </h2>

      {/* The track is duplicated so the -50% translate loops seamlessly; the copy
          is hidden from assistive tech and the marquee stops for reduced-motion
          users, who get a normal horizontal scroll instead. */}
      <div className="marquee mt-6">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
              aria-hidden={copy === 1}
            >
              {items.map((client, i) => (
                <Logo key={`${copy}-${i}`} {...client} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
