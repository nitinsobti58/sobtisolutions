export type PropertyStatus = "owned" | "renovating" | "leased" | "sold";
export type PropertyType =
  | "single-family"
  | "multi-family"
  | "condo"
  | "commercial"
  | "land";

export type Property = {
  slug: string;
  /** Display name, e.g. "Two-family — Ocean County". */
  name: string;
  /** Public locality, e.g. "Toms River, NJ". This is what renders. */
  area: string;
  /** Full street address. NEVER rendered unless showAddress is true. */
  address?: string;
  /** Default false. Flipping to true requires family sign-off. */
  showAddress?: boolean;
  type: PropertyType;
  status: PropertyStatus;
  /** Paths under /public/properties/<slug>/. Empty means the designed placeholder renders. */
  photos: string[];
  /** One or two sentences. */
  blurb: string;
  /** Year acquired. */
  acquired?: number;
  /** Lower sorts first. */
  order: number;
  /** Shown in the homepage strip. */
  featured?: boolean;
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  "single-family": "Single-family",
  "multi-family": "Multi-family",
  condo: "Condo",
  commercial: "Commercial",
  land: "Land",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  owned: "Owned",
  renovating: "Renovating",
  leased: "Leased",
  sold: "Sold",
};

/**
 * The inventory. Single source of truth: the grid, the homepage strip, and the
 * empty state all derive from this array. Adding a property is one entry here
 * plus photos under /public/properties/<slug>/, nothing else.
 */
export const properties: Property[] = [
  // TODO: placeholder entries. Replace with the real inventory and photos.
  {
    slug: "placeholder-two-family",
    name: "Two-family residence",
    area: "Toms River, NJ",
    type: "multi-family",
    status: "leased",
    photos: [],
    blurb:
      "Placeholder entry. Two-unit residential property held for long-term rental income.",
    acquired: 2023,
    order: 1,
    featured: true,
  },
  {
    slug: "placeholder-single-family",
    name: "Single-family residence",
    area: "Ocean County, NJ",
    type: "single-family",
    status: "renovating",
    photos: [],
    blurb:
      "Placeholder entry. Single-family home being renovated ahead of leasing.",
    acquired: 2024,
    order: 2,
    featured: true,
  },
  {
    slug: "placeholder-condo",
    name: "Bayside condominium",
    area: "Brick, NJ",
    type: "condo",
    status: "owned",
    photos: [],
    blurb: "Placeholder entry. One-bedroom condominium held for lease.",
    acquired: 2022,
    order: 3,
    featured: true,
  },
];

export const sortedProperties = [...properties].sort((a, b) => a.order - b.order);

export const featuredProperties = sortedProperties.filter((p) => p.featured);

export function getProperty(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}
