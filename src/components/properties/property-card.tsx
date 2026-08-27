import Image from "next/image";

import { Traverse } from "@/components/brand/traverse";
import {
  leadPhoto,
  propertyStatusLabels,
  propertyTypeLabels,
  publicAddress,
  type Property,
} from "@/data/properties";

type Props = {
  property: Property;
  /** h3 under a section heading (homepage strip); h2 directly under a page h1 (/properties). */
  headingLevel?: "h2" | "h3";
};

/**
 * A card is a box drawn in line, not a filled tile. The 4:3 frame holds the lead photo
 * when there is one and a seeded parcel sketch when there is not; the caption, body,
 * and chips are identical either way, so a half-photographed grid never looks unfinished.
 * The address renders only through publicAddress(); the Property object is never spread.
 */
export function PropertyCard({ property, headingLevel: Heading = "h3" }: Props) {
  const type = propertyTypeLabels[property.type];
  const status = propertyStatusLabels[property.status];
  const photo = leadPhoto(property);
  const address = publicAddress(property);

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
        {photo ? (
          <Image
            src={photo}
            alt={`${property.name}, ${property.area}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Traverse variant="card" seed={property.slug} />
        )}
        <p
          className={
            photo
              ? "absolute bottom-3 left-3 rounded-lg bg-background px-2 py-1 font-heading text-[11px] leading-4 font-medium tracking-[0.06em] uppercase text-muted-foreground"
              : "absolute bottom-3 left-4 font-heading text-[11px] leading-4 font-medium tracking-[0.06em] uppercase text-muted-foreground"
          }
        >
          {type}
          <br />
          {property.area}
        </p>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <Heading className="font-heading text-lg font-medium">{property.name}</Heading>
          {address ? <p className="text-[15px] text-muted-foreground">{address}</p> : null}
        </div>
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
