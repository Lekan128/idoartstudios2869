import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import commissionData from "../data/commission.json";
import siteData from "../data/site.json";
import type { CommissionData, SiteData } from "../types";
import Step from "../components/commission/Step";
import SubjectPicker from "../components/commission/SubjectPicker";
import ExaggerationToggle from "../components/commission/ExaggerationToggle";
import StyleStep from "../components/commission/StyleStep";
import StyleCompare from "../components/commission/StyleCompare";
import QuantityStep from "../components/commission/QuantityStep";
import ExtrasStep from "../components/commission/ExtrasStep";
import SummaryBar from "../components/commission/SummaryBar";
import { Assurances, Faq, HowItWorks, PriceTable } from "../components/commission/TrustSections";
import {
  buildOrderMessage,
  EMPTY_SELECTION,
  orderReference,
  quote as buildQuote,
  sanitizeSelection,
  selectionFromParams,
  selectionToParams,
  whatsappLink,
  withDefaults,
} from "../lib/commission";
import type { Selection } from "../lib/commission";
import { track } from "../lib/analytics";
import { scrollIntoSpace, scrollSettleMs, scrollToId } from "../lib/scroll";

const data = commissionData as CommissionData;
const site = siteData as SiteData;

const STORAGE_KEY = "ida.commission.selection";

/**
 * A shared link always wins over a saved draft — it's what the sender meant to show.
 * Whatever is still unanswered is filled with a default, so the order is complete
 * and priced on arrival.
 */
function initialSelection(): Selection {
  if (typeof window === "undefined") return withDefaults(data, EMPTY_SELECTION);

  const fromUrl = selectionFromParams(data, new URLSearchParams(window.location.search));
  if (Object.keys(fromUrl).length > 0) return withDefaults(data, sanitizeSelection(data, fromUrl));

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return withDefaults(data, sanitizeSelection(data, JSON.parse(raw) as Partial<Selection>));
  } catch {
    // Private mode / blocked storage — start clean rather than fail.
  }
  return withDefaults(data, EMPTY_SELECTION);
}

export default function Commission() {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  // Read once on arrival: only a homepage "Order …" card starts the guided walk.
  // The menu link, a shared link or a bookmark opens the page at the top and
  // lets the visitor choose; their choices still walk them on from there.
  const location = useLocation();
  const [fromHomeCard] = useState(() => Boolean((location.state as { fromHomeCard?: boolean } | null)?.fromHomeCard));
  const [comparing, setComparing] = useState(false);
  // Fixed for the life of the visit so the ref the owner sees matches the one on screen.
  const [reference] = useState(() => orderReference());
  // Bumped whenever the order button should draw the eye.
  const [orderCue, setOrderCue] = useState(0);
  const cueTimer = useRef<number | undefined>(undefined);
  const lastCueAt = useRef(0);

  /**
   * Nudges the order button after `delay` ms. Several triggers can land close
   * together (a tap that also scrolls the last step into view), so a cue within
   * a moment of the previous one is dropped rather than restarting it.
   */
  const cueOrder = useCallback((delay = 0) => {
    window.clearTimeout(cueTimer.current);
    cueTimer.current = window.setTimeout(() => {
      const now = Date.now();
      if (now - lastCueAt.current < 1500) return;
      lastCueAt.current = now;
      setOrderCue((n) => n + 1);
    }, delay);
  }, []);

  // The order bar rises in on arrival; once it has settled, nudge so the visitor
  // registers that ordering is one tap away before they start choosing.
  useEffect(() => {
    cueOrder(1100);
  }, [cueOrder]);

  // Reaching "How many people?" — by the guided scroll or by scrolling there
  // themselves, which is common since every step is already answered — is the
  // moment the order is ready, so nudge then too. Once per visit.
  useEffect(() => {
    const el = document.getElementById("step-quantity");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        cueOrder(scrollSettleMs());
        observer.disconnect();
      },
      // Fully clear of the order bar, not just peeking out from behind it.
      { threshold: 1, rootMargin: "0px 0px -140px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cueOrder]);

  useEffect(() => {
    document.title = data.seoTitle;
    const arrivedWith = new URLSearchParams(window.location.search).get("type");
    track("commission_viewed", { arrived_with: arrivedWith ?? "", from_home_card: fromHomeCard });

    // Arriving from a homepage card: the option is already chosen, so walk them
    // straight on to the next step.
    if (fromHomeCard) scrollIntoSpace("step-exaggeration", "order-bar");

    return () => window.clearTimeout(cueTimer.current);
    // fromHomeCard is fixed for the visit, so this still runs once, on arrival.
  }, [fromHomeCard]);

  const quote = useMemo(() => buildQuote(data, selection), [selection]);

  // Keep the URL in step with the selection so an order can be shared or bookmarked.
  // replaceState rather than router navigation: every tap would otherwise add history.
  useEffect(() => {
    const params = selectionToParams(selection);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // Storage is a convenience here, never a requirement.
    }
  }, [selection]);

  const update = useCallback((patch: Partial<Selection>) => {
    setSelection((prev) => sanitizeSelection(data, { ...prev, ...patch }));
  }, []);

  // Every choice walks the visitor on to the next: what → exaggeration → style →
  // how many people. Everything is already answered with a default, so this is
  // guidance, not a gate — the order can be sent from any point.
  const chooseSubject = (id: string) => {
    update({ subjectId: id });
    track("commission_subject_selected", { subject: id });
    scrollIntoSpace("step-exaggeration", "order-bar");
  };

  const chooseExaggeration = (id: string) => {
    update({ exaggerationId: id });
    track("commission_exaggeration_selected", { subject: selection.subjectId ?? "", exaggeration: id });
    scrollIntoSpace("step-style", "order-bar");
  };

  // The last stop: "How many people?" lands just above the order bar, with the
  // choices made so far still in view above it, and once the scroll settles the
  // order button nudges — this is the moment to say "you're ready, tap here".
  const chooseStyle = (id: string) => {
    update({ styleId: id });
    track("commission_style_selected", {
      subject: selection.subjectId ?? "",
      exaggeration: selection.exaggerationId ?? "",
      style: id,
    });
    scrollIntoSpace("step-quantity", "order-bar", "bottom");
    cueOrder(scrollSettleMs());
  };

  const toggleCompare = () => {
    const next = !comparing;
    setComparing(next);
    if (next) {
      track("commission_style_compared", { subject: selection.subjectId ?? "" });
      scrollToId("style-compare");
    }
  };

  const message = useMemo(
    () => buildOrderMessage(data, selection, quote, reference),
    [selection, quote, reference],
  );
  const href = whatsappLink(site.whatsappNumber, message);

  const subject = quote.subject;

  return (
    // Room at the bottom for the fixed order bar, so it never covers the FAQ.
    <div className="bg-pink-50/40 pb-32">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-pink-600">{data.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{data.heading}</h1>
          {data.intro && <p className="mt-2 text-sm text-neutral-600 sm:text-base">{data.intro}</p>}
        </header>

        {/* The order itself is one centred column, like a checkout: a single left
            edge to read straight down, every option group the same width, no
            lopsided empty band beside it. The reference sections below use the
            full page width. */}
        <div id="order-form" className="mx-auto mt-8 max-w-3xl scroll-mt-24 space-y-6 sm:space-y-8">
          <Step id="step-subject" title={data.subjectStepTitle} hint={data.subjectStepHint}>
            <SubjectPicker data={data} selectedId={selection.subjectId} onSelect={chooseSubject} />
          </Step>

          <Step id="step-exaggeration" title={data.exaggerationStepTitle} hint={data.exaggerationStepHint}>
            <ExaggerationToggle
              options={data.exaggerations}
              selectedId={selection.exaggerationId}
              onSelect={chooseExaggeration}
            />
          </Step>

          <Step id="step-style" title={data.styleStepTitle} hint={data.styleStepHint}>
            <StyleStep
              data={data}
              subjectId={selection.subjectId}
              selectedId={selection.styleId}
              comparing={comparing}
              onSelect={chooseStyle}
              onToggleCompare={toggleCompare}
            />
            {comparing && (
              <StyleCompare data={data} subjectId={selection.subjectId} selectedId={selection.styleId} onSelect={chooseStyle} />
            )}
          </Step>

          <Step id="step-quantity" title={data.quantityStepTitle} hint={data.quantityStepHint}>
            <QuantityStep
              data={data}
              quantity={selection.quantity}
              artworkModeId={selection.artworkModeId}
              onQuantityChange={(quantity) => {
                update({ quantity });
                track("commission_quantity_selected", { quantity });
                // More than one person reveals "How should we draw them?" (and 4+ its
                // price note): one last scroll so that ends just above the order bar.
                if (quantity > 1) {
                  scrollIntoSpace("step-quantity", "order-bar", "bottom");
                  cueOrder(scrollSettleMs());
                } else {
                  cueOrder();
                }
              }}
              onModeChange={(artworkModeId) => {
                update({ artworkModeId });
                track("commission_artwork_mode_selected", { artwork_mode: artworkModeId });
                cueOrder();
              }}
            />
          </Step>

          {subject?.needsExtras && (
            <Step id="step-extras" title={data.extrasStepTitle} hint={data.extrasStepHint}>
              <ExtrasStep data={data} value={selection.extras} onChange={(extras) => update({ extras })} />
            </Step>
          )}

          <section className="border-t border-pink-100 pt-6 sm:pt-8">
            <label htmlFor="commission-note" className="block text-sm font-semibold text-neutral-800">
              {data.noteLabel}
            </label>
            <textarea
              id="commission-note"
              value={selection.note}
              onChange={(e) => update({ note: e.target.value })}
              rows={2}
              placeholder={data.notePlaceholder}
              className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelection(withDefaults(data, EMPTY_SELECTION));
                  setComparing(false);
                  scrollToId("order-form");
                  track("commission_cleared");
                }}
                className="text-xs font-semibold text-neutral-500 underline underline-offset-4 hover:text-pink-600"
              >
                {data.startOverLabel}
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Order ref {reference}
              </span>
            </div>
          </section>

        </div>

        <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
          <HowItWorks data={data} />
          <Assurances data={data} />
          <PriceTable data={data} />
          <Faq data={data} />
        </div>
      </div>

      <SummaryBar
        data={data}
        quote={quote}
        href={href}
        cue={orderCue}
        onOrder={() =>
          track("commission_order_sent", {
            subject: selection.subjectId ?? "",
            exaggeration: selection.exaggerationId ?? "",
            style: selection.styleId ?? "",
            quantity: selection.quantity,
            total: quote.total ?? 0,
            reference,
          })
        }
      />
    </div>
  );
}
