import homeData from "../../data/home.json";
import stylesData from "../../data/styles.json";
import type { HomeData, StyleOption } from "../../types";
import SectionHeading from "./SectionHeading";
import StyleCard from "./StyleCard";

const home = homeData as HomeData;
const styles = (stylesData as { items: StyleOption[] }).items;

export default function StyleOptions() {
  return (
    <section id="packages" className="bg-pink-50/60 py-16 sm:py-20">
      <SectionHeading eyebrow={home.packagesEyebrow} title={home.packagesTitle} />

      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">
        {styles.map((style, i) => (
          <StyleCard key={i} {...style} />
        ))}
      </div>
    </section>
  );
}
