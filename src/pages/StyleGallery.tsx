import { useEffect, useMemo, useState } from "react";
import galleryData from "../data/style-gallery.json";
import siteData from "../data/site.json";
import type { SiteData, StyleGalleryData } from "../types";
import StyleGalleryCard from "../components/order/StyleGalleryCard";
import OrderBar from "../components/order/OrderBar";
import { buildOrderMessage, summarize, whatsappLink } from "../lib/order";
import type { OrderLines } from "../lib/order";

const data = galleryData as StyleGalleryData;
const site = siteData as SiteData;

export default function StyleGallery() {
  const [order, setOrder] = useState<OrderLines>({});
  const [note, setNote] = useState("");

  useEffect(() => {
    document.title = data.seoTitle;
  }, []);

  const summary = useMemo(() => summarize(data.items, order), [order]);

  const href = useMemo(
    () =>
      whatsappLink(
        site.whatsappNumber,
        buildOrderMessage({
          summary,
          currency: data.currency,
          orderIntro: data.orderIntro,
          quoteLabel: data.quoteLabel,
          note,
        }),
      ),
    [summary, note],
  );

  const setQuantity = (name: string, quantity: number) => {
    setOrder((prev) => {
      const next = { ...prev };
      if (quantity > 0) next[name] = quantity;
      else delete next[name];
      return next;
    });
  };

  return (
    // Bottom padding keeps the last row clear of the sticky order bar.
    <div className="bg-pink-50/40 pb-32">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-pink-600">{data.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{data.heading}</h1>
          {data.intro && <p className="mt-4 text-neutral-600">{data.intro}</p>}
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <StyleGalleryCard
              key={item.name}
              item={item}
              currency={data.currency}
              quoteLabel={data.quoteLabel}
              quantity={order[item.name] ?? 0}
              onChange={(quantity) => setQuantity(item.name, quantity)}
            />
          ))}
        </div>

        {summary.itemCount === 0 && (
          <p className="mt-10 text-center text-sm text-neutral-500">
            Add one or more styles above, then send your order to us on WhatsApp.
          </p>
        )}
      </div>

      <OrderBar
        summary={summary}
        currency={data.currency}
        quoteLabel={data.quoteLabel}
        note={note}
        onNoteChange={setNote}
        onClear={() => {
          setOrder({});
          setNote("");
        }}
        href={href}
      />
    </div>
  );
}
