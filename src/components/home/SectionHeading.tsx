interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

export default function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-pink-400" aria-hidden="true" />
        <p className="text-xs font-bold tracking-widest text-pink-600">{eyebrow}</p>
        <span className="h-px w-8 bg-pink-400" aria-hidden="true" />
      </div>
      <h2 className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{title}</h2>
    </div>
  );
}
