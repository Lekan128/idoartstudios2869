import { Link } from "react-router-dom";
import homeData from "../../data/home.json";
import commissionData from "../../data/commission.json";
import type { CommissionData, HomeData } from "../../types";
import { lowestPriceForSubject } from "../../lib/commission";
import SectionHeading from "./SectionHeading";
import StyleCard from "./StyleCard";

const home = homeData as HomeData;
const commission = commissionData as CommissionData;

export default function StyleOptions() {
  return (
    <section id="packages" className="bg-pink-50/60 py-16 sm:py-20">
      <SectionHeading eyebrow={home.packagesEyebrow} title={home.packagesTitle} />

      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">
        {commission.subjects.map((subject) => (
          <StyleCard
            key={subject.id}
            subject={subject}
            from={lowestPriceForSubject(commission, subject.id)}
            currency={commission.currency}
            fromLabel={commission.fromLabel}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/styles/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-semibold text-pink-600 shadow-sm ring-1 ring-pink-200 transition-colors hover:bg-pink-600 hover:text-white"
        >
          See all styles &amp; prices
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
