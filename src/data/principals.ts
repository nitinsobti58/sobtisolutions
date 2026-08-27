export type Principal = {
  name: string;
  role: string;
  /** Path under /public/principals/. */
  photo?: string;
};

/**
 * The people who run the company. Empty until the family signs off on names and
 * photos; the /about page renders the section only when there are entries.
 */
// TODO: add the three principals once the family has approved names and photos.
export const principals: Principal[] = [];
