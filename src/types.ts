export interface NavLink {
  label: string;
  href: string;
}

export interface SiteData {
  brandName: string;
  tagline: string;
  logo: string;
  nav: NavLink[];
  bookEventUrl: string;
  bookEventLabel: string;
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  footerTagline: string;
}

export interface HomeData {
  eyebrow: string;
  headlinePlain: string;
  headlineAccent: string;
  subheadline: string;
  heroImage: string;
  heroCaption: string;
  heroBackgroundImage?: string;
  /** Text of the hero's second button, which goes to the online order page. */
  orderOnlineLabel?: string;
  galleryEyebrow: string;
  galleryTitle: string;
  packagesEyebrow: string;
  packagesTitle: string;
}

export interface GalleryItem {
  image: string;
  alt: string;
}

export interface AboutData {
  seoTitle: string;
  seoDescription: string;
  heading: string;
  intro: string;
  bodyParagraphs: string[];
  highlights: string[];
  artistImage: string;
}

export interface ServicePageSection {
  title: string;
  body: string;
}

export interface ServicePageData {
  seoTitle: string;
  seoDescription: string;
  heading: string;
  intro: string;
  sections: ServicePageSection[];
}

export interface ReactionVideoData {
  eyebrow: string;
  title: string;
  youtubeId: string;
  caption: string;
}

export interface ClientLogo {
  name: string;
  logo: string;
  url: string;
}

export interface ClientsData {
  title: string;
  items: ClientLogo[];
}

/* ---------------------------------------------------------------------------
   Commissioned caricature ordering (the /styles page).

   The visitor builds one artwork: a subject (what we draw), how much to
   exaggerate, a style (how we draw it) and how many people, plus optional
   add-ons. Exaggeration is a preference only; it never changes the price. Price comes from the
   `pricing` matrix rather than living on either half of the pair, because a
   full-body Realistic piece is not the same job as a Realistic portrait.
--------------------------------------------------------------------------- */

/** A picture-card option with no price of its own. */
export interface CommissionChoice {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  alt: string;
}

export interface CommissionSubject extends CommissionChoice {
  /** Stable key referenced by CommissionPrice.subject and the ?type= deep link. */
  id: string;
  /** True for the option that asks the visitor to describe extras (car, pet, house…). */
  needsExtras: boolean;
}

export interface CommissionStyle {
  /** Stable key referenced by CommissionPrice.style and the ?style= deep link. */
  id: string;
  name: string;
  /** Optional ribbon, e.g. "Most popular". Empty string hides it. */
  badge: string;
  tagline: string;
  description: string;
  bestFor: string;
  images: { image: string; alt: string }[];
}

/** One cell of the subject x style price matrix. A missing cell reads as "on request". */
export interface CommissionPrice {
  subject: string;
  style: string;
  price: number;
}

export interface CommissionQuantity {
  value: number;
  label: string;
  /** True for the open-ended top option (4+), which is quoted rather than calculated. */
  onRequest: boolean;
}

export interface CommissionArtworkMode {
  id: string;
  label: string;
  hint: string;
}

export interface CommissionStep {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CommissionData {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  intro: string;
  priceAnchor: string;
  currency: string;
  onRequestLabel: string;
  /** Pre-selected style id, so the visitor arrives at a priced order. Falls back to the badged style. */
  defaultStyle?: string;
  /** Pre-selected exaggeration id. Falls back to the first listed. */
  defaultExaggeration?: string;

  subjectStepTitle: string;
  subjectStepHint: string;
  exaggerationStepTitle: string;
  exaggerationStepHint: string;
  styleStepTitle: string;
  styleStepHint: string;
  styleCompareLabel: string;
  quantityStepTitle: string;
  quantityStepHint: string;
  extrasStepTitle: string;
  extrasStepHint: string;
  extrasPlaceholder: string;
  extrasPriceNotice: string;

  summaryTitle: string;
  orderCtaLabel: string;
  orderCtaHint: string;
  noteLabel: string;
  notePlaceholder: string;
  startOverLabel: string;

  subjects: CommissionSubject[];
  /** Referenced by the ?exaggeration= deep link. */
  exaggerations: CommissionChoice[];
  styles: CommissionStyle[];
  pricing: CommissionPrice[];
  quantities: CommissionQuantity[];
  quantityOnRequestNotice: string;
  artworkModes: CommissionArtworkMode[];

  howItWorksTitle: string;
  howItWorks: CommissionStep[];
  assuranceTitle: string;
  assurances: CommissionStep[];
  priceTableTitle: string;
  priceTableNote: string;
  faqTitle: string;
  faqs: FaqItem[];

  whatsappIntro: string;
  whatsappClosing: string;
}

/* ---------------------------------------------------------------------------
   Event plans and booking (on the Event Caricature page). Visitors pick an
   experience, then fill one short form; every request is stored by Netlify
   Forms and handed over to WhatsApp.
--------------------------------------------------------------------------- */

export interface EventFact {
  title: string;
  body: string;
}

/** The full-event price. 0 reads "on request". */
export interface EventPlanFullEvent {
  price: number;
  /** Small print, e.g. "Up to 60 T-shirts". */
  note: string;
}

/**
 * The shorter booking. "hour": `price` is per hour and a booking is at least
 * `hours` long. "package": `price` is the fixed price for `hours`.
 */
export interface EventPlanHourly {
  price: number;
  unit: "hour" | "package";
  hours: number;
  note: string;
}

export interface EventPlan {
  /** Stable key used in the form and analytics. */
  id: string;
  name: string;
  /** Optional ribbon, e.g. "Most popular". Empty string hides it. */
  badge: string;
  tagline: string;
  fullEvent: EventPlanFullEvent;
  hourly: EventPlanHourly;
  features: string[];
  /** Example photos from real events. The first shows on the card; all of them
   *  rotate on the card and open in the full-screen viewer. Optional. */
  images: { image: string; alt: string }[];
}

export interface EventBookingData {
  plansTitle: string;
  plansHint: string;
  currency: string;
  plans: EventPlan[];

  formTitle: string;
  /** Used once a plan is chosen; {plan} is replaced with its name. */
  formTitleWithPlan: string;
  formHint: string;
  notSureLabel: string;
  eventTypes: string[];
  sendLabel: string;
  sendHint: string;

  sentTitle: string;
  sentBody: string;

  nextStepsTitle: string;
  nextSteps: EventFact[];
  whyTitle: string;

  whatsappIntro: string;
}
