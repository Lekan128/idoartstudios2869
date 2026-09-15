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
  galleryEyebrow: string;
  galleryTitle: string;
  packagesEyebrow: string;
  packagesTitle: string;
}

export interface GalleryItem {
  image: string;
  alt: string;
}

export interface StyleOption {
  title: string;
  description: string;
  note: string;
  image: string;
  ctaLabel: string;
  ctaUrl: string;
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
