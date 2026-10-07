import { useEffect, useRef, useState } from "react";
import homeData from "../../data/home.json";
import commissionData from "../../data/commission.json";
import type { CommissionData, HomeData } from "../../types";
import SectionHeading from "./SectionHeading";
import StyleCard from "./StyleCard";

const home = homeData as HomeData;
const commission = commissionData as CommissionData;

export default function StyleOptions() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Play the card zoom once, the first time the cards are properly on screen.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="packages" className="bg-pink-50/60 py-16 sm:py-20">
      <SectionHeading eyebrow={home.packagesEyebrow} title={home.packagesTitle} />

      <div ref={gridRef} className="mx-auto mt-10 grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:gap-6">
        {commission.subjects.map((subject, i) => (
          <StyleCard key={subject.id} subject={subject} zoomOrder={inView ? i : null} />
        ))}
      </div>
    </section>
  );
}
