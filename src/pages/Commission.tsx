import { useCallback, useEffect, useMemo, useState } from "react";
import commissionData from "../data/commission.json";
import siteData from "../data/site.json";
import type { CommissionData, SiteData } from "../types";
import Step from "../components/commission/Step";
import SubjectStep from "../components/commission/SubjectStep";
import StyleStep from "../components/commission/StyleStep";
import StyleCompare from "../components/commission/StyleCompare";
import QuantityStep from "../components/commission/QuantityStep";
import ExtrasStep from "../components/commission/ExtrasStep";
import AddonStep from "../components/commission/AddonStep";
import SummaryBar from "../components/commission/SummaryBar";
import { Assurances, Faq, HowItWorks, PriceTable } from "../components/commission/TrustSections";
import {
  buildOrderMessage,
  EMPTY_SELECTION,
  formatPrice,
  lowestPriceOverall,
  orderReference,
  quote as buildQuote,
  sanitizeSelection,
  selectionFromParams,
  selectionToParams,
  whatsappLink,
} from "../lib/commission";
import type { Selection } from "../lib/commission";
import { track } from "../lib/analytics";
import { scrollToId } from "../lib/scroll";

const data = commissionData as CommissionData;
const site = siteData as SiteData;

const STORAGE_KEY = "ida.commission.selection";

/** A shared link always wins over a saved draft — it's what the sender meant to show. */
function initialSelection(): Selection {
  if (typeof window === "undefined") return EMPTY_SELECTION;

  const fromUrl = selectionFromParams(data, new URLSearchParams(window.location.search));
  if (Object.keys(fromUrl).length > 0) return sanitizeSelection(data, fromUrl);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitizeSelection(data, JSON.parse(raw) as Partial<Selection>);
  } catch {
    // Private mode / blocked storage — start clean rather than fail.
  }
  return EMPTY_SELECTION;
}

export default function Commission() {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [comparing, setComparing] = useState(false);
  // Fixed for the life of the visit so the ref the owner sees matches the one on screen.
  const [reference] = useState(orderReference);

  useEffect(() => {
    document.title = data.seoTitle;
  }, []);

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

  const chooseSubject = (id: string) => {
    const subject = data.subjects.find((s) => s.id === id);
    update({ subjectId: id });
    track("commission_subject_selected", { subject: id });
    if (subject) scrollToId("step-style");
  };

  const chooseStyle = (id: string) => {
    update({ styleId: id });
    track("commission_style_selected", { subject: selection.subjectId ?? "", style: id });
    scrollToId("step-quantity");
  };

  const toggleAddon = (id: string) => {
    const next = selection.addonIds.includes(id)
      ? selection.addonIds.filter((a) => a !== id)
      : [...selection.addonIds, id];
    update({ addonIds: next });
    track("commission_addon_toggled", { addon: id, selected: next.includes(id) });
  };

  const message = useMemo(
    () => buildOrderMessage(data, selection, quote, reference),
    [selection, quote, reference],
  );
  const href = whatsappLink(site.whatsappNumber, message);

  const subject = quote.subject;
  const showExtras = Boolean(subject?.needsExtras && selection.styleId);

  // The extras step only exists for one option, so the numbers that follow it shift.
  let stepNumber = 2;
  const nextNumber = () => stepNumber++;

  const from = lowestPriceOverall(data);

  return (
    <div className="bg-pink-50/40 pb-40">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-pink-600">{data.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{data.heading}</h1>
          {data.intro && <p className="mt-4 text-neutral-600">{data.intro}</p>}
          {from !== null && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-neutral-900 shadow-sm ring-1 ring-pink-200">
              <span className="text-pink-600">★</span>
              {data.priceAnchor || `${data.fromLabel} ${formatPrice(from, data.currency)}`}
            </p>
          )}
        </header>

        <div className="mt-10 space-y-8 sm:space-y-10">
          <Step
            id="step-subject"
            index={1}
            title={data.subjectStepTitle}
            hint={data.subjectStepHint}
            answer={subject?.name}
          >
            <SubjectStep data={data} selectedId={selection.subjectId} onSelect={chooseSubject} />
          </Step>

          {selection.subjectId && (
            <Step
              id="step-style"
              index={nextNumber()}
              title={data.styleStepTitle}
              hint={data.styleStepHint}
              answer={quote.style?.name}
            >
              <StyleStep
                data={data}
                subjectId={selection.subjectId}
                selectedId={selection.styleId}
                onSelect={chooseStyle}
                onCompare={() => {
                  setComparing(true);
                  track("commission_style_compared", { subject: selection.subjectId ?? "" });
                }}
              />
            </Step>
          )}

          {selection.styleId && (
            <Step
              id="step-quantity"
              index={nextNumber()}
              title={data.quantityStepTitle}
              hint={data.quantityStepHint}
              answer={data.quantities.find((q) => q.value === selection.quantity)?.label}
            >
              <QuantityStep
                data={data}
                quantity={selection.quantity}
                artworkModeId={selection.artworkModeId}
                onQuantityChange={(quantity) => {
                  update({ quantity });
                  track("commission_quantity_selected", { quantity });
                }}
                onModeChange={(artworkModeId) => update({ artworkModeId })}
              />
            </Step>
          )}

          {showExtras && (
            <Step id="step-extras" index={nextNumber()} title={data.extrasStepTitle} hint={data.extrasStepHint}>
              <ExtrasStep data={data} value={selection.extras} onChange={(extras) => update({ extras })} />
            </Step>
          )}

          {selection.styleId && (
            <Step id="step-addons" index={nextNumber()} title={data.addonStepTitle} hint={data.addonStepHint}>
              <AddonStep
                data={data}
                selectedIds={selection.addonIds}
                artworkCount={quote.artworkCount}
                onToggle={toggleAddon}
              />
            </Step>
          )}

          <HowItWorks data={data} />
          <Assurances data={data} />
          <PriceTable data={data} />
          <Faq data={data} />
        </div>
      </div>

      {comparing && (
        <StyleCompare
          data={data}
          subjectId={selection.subjectId}
          selectedId={selection.styleId}
          onSelect={(id) => update({ styleId: id })}
          onClose={() => setComparing(false)}
        />
      )}

      <SummaryBar
        data={data}
        quote={quote}
        note={selection.note}
        reference={reference}
        href={href}
        onNoteChange={(note) => update({ note })}
        onClear={() => {
          setSelection(EMPTY_SELECTION);
          scrollToId("step-subject");
          track("commission_cleared");
        }}
        onOrder={() =>
          track("commission_order_sent", {
            subject: selection.subjectId ?? "",
            style: selection.styleId ?? "",
            quantity: selection.quantity,
            addons: selection.addonIds.join(","),
            total: quote.total ?? 0,
            reference,
          })
        }
      />
    </div>
  );
}
