import { PropertyCard } from "@/components/properties/property-card";
import { PropertiesEmpty } from "@/components/properties/properties-empty";
import type { Property } from "@/data/properties";

type Props = {
  properties: Property[];
};

/** Fully data-driven: an empty inventory renders the designed empty state, not a blank page. */
export function PropertyGrid({ properties }: Props) {
  if (properties.length === 0) {
    return <PropertiesEmpty />;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.slug} property={property} headingLevel="h2" />
      ))}
    </div>
  );
}
