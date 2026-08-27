import type { Metadata } from "next";

import { PropertyGrid } from "@/components/properties/property-grid";
import { sortedProperties } from "@/data/properties";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "Residential properties held by Sobti Solutions LLC in Ocean County, New Jersey, listed by town.",
};

export default function PropertiesPage() {
  return (
    <main className="wrap flex flex-1 flex-col gap-10 py-16 md:py-24">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-4xl leading-[1.08] font-medium tracking-[-0.015em] md:text-5xl">
          Properties
        </h1>
        <p className="max-w-[52ch] text-[19px] leading-normal text-pretty">
          What we hold in Ocean County. Locations are listed by town; write to
          us for anything more specific.
        </p>
      </div>
      <PropertyGrid properties={sortedProperties} />
    </main>
  );
}
