import { Traverse } from "@/components/brand/traverse";
import {
  propertyStatusLabels,
  propertyTypeLabels,
  type Property,
} from "@/data/properties";

type Props = {
  property: Property;
};

/**
 * A card is a box drawn in line, not a filled tile. With no photo the frame holds a
 * seeded parcel sketch; a photo later replaces only the inside of the same frame.
 * Renders name, area, type, status, and year only — never the address.
 */
export function PropertyCard({ property }: Props) {
  const type = propertyTypeLabels[property.type];
  const status = propertyStatusLabels[property.status];

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card">
      <div className="relative aspect-[4/3] border-b border-border">
        <Traverse variant="card" seed={property.slug} />
        <p className="absolute bottom-3 left-4 font-heading text-[11px] leading-4 font-medium tracking-[0.06em] uppercase text-muted-foreground">
          {type}
          <br />
          {property.area}
        </p>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="font-heading text-lg font-medium">{property.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          <Chip>{status}</Chip>
          {property.acquired ? <Chip>Acquired {property.acquired}</Chip> : null}
        </div>
      </div>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded-lg border border-border px-1.5 font-heading text-[11px] font-medium tracking-[0.06em] uppercase text-muted-foreground">
      {children}
    </span>
  );
}
