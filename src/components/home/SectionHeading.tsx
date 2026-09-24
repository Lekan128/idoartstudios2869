interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** "responsive" centres on mobile and left-aligns from md up, for two-column sections. */
  align?: "center" | "responsive";
}

export default function SectionHeading({ eyebrow, title, align = "center" }: SectionHeadingProps) {
  const responsive = align === "responsive";

  return (
    <div className={responsive ? "max-w-xl text-center md:text-left" : "mx-auto max-w-xl text-center"}>
      <div className={`flex items-center justify-center gap-3 ${responsive ? "md:justify-start" : ""}`}>
        <span className="h-px w-8 bg-pink-400" aria-hidden="true" />
        <p className="text-xs font-bold tracking-widest text-pink-600">{eyebrow}</p>
        <span className={`h-px w-8 bg-pink-400 ${responsive ? "md:hidden" : ""}`} aria-hidden="true" />
      </div>
      <h2 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{title}</h2>
    </div>
  );
}
