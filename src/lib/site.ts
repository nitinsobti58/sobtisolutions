/** Single source of truth for site-wide metadata. Everything that needs the name, URL, contact email, or legal line reads from here. */
export const site = {
  name: "Sobti Solutions",
  url: "https://sobtisolutions.com",
  title: "Sobti Solutions — Real estate holding company in Ocean County, NJ",
  description:
    "Sobti Solutions LLC is a family-owned real estate holding company based in Ocean County, New Jersey.",
  email: "info@sobtisolutions.com",
  areaServed: "Ocean County, New Jersey",
  locality: "Toms River, New Jersey",
  // TODO: confirm the exact registered LLC name and state of formation for the footer legal line.
  legalName: "Sobti Solutions LLC",
  stateOfFormation: "New Jersey",
} as const;

export type Site = typeof site;
