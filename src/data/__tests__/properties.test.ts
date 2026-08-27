import { describe, expect, it } from "vitest";

import {
  featuredProperties,
  getProperty,
  leadPhoto,
  properties,
  publicAddress,
  sortedProperties,
  type Property,
} from "@/data/properties";

const base: Property = {
  slug: "fixture",
  name: "Fixture",
  area: "Toms River, NJ",
  type: "single-family",
  status: "owned",
  photos: [],
  blurb: "Fixture.",
  order: 1,
};

describe("inventory helpers", () => {
  it("sorts by order ascending", () => {
    const orders = sortedProperties.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("features only entries flagged featured, in order", () => {
    expect(featuredProperties.every((p) => p.featured)).toBe(true);
    expect(featuredProperties).toEqual(sortedProperties.filter((p) => p.featured));
  });

  it("looks entries up by slug", () => {
    expect(getProperty(properties[0].slug)).toBe(properties[0]);
    expect(getProperty("nope")).toBeUndefined();
  });

  it("keeps every seed area-only", () => {
    for (const p of properties) {
      expect(publicAddress(p)).toBeUndefined();
    }
  });
});

describe("publicAddress", () => {
  const address = "12 Example Street";

  it("withholds the address unless showAddress is exactly true", () => {
    expect(publicAddress({ ...base, address })).toBeUndefined();
    expect(publicAddress({ ...base, address, showAddress: false })).toBeUndefined();
    expect(publicAddress({ ...base, address, showAddress: undefined })).toBeUndefined();
  });

  it("returns the address only after opt-in", () => {
    expect(publicAddress({ ...base, address, showAddress: true })).toBe(address);
    expect(publicAddress({ ...base, showAddress: true })).toBeUndefined();
  });
});

describe("leadPhoto", () => {
  it("returns the first photo or undefined", () => {
    expect(leadPhoto(base)).toBeUndefined();
    expect(leadPhoto({ ...base, photos: ["/properties/fixture/1.jpg", "/x.jpg"] })).toBe(
      "/properties/fixture/1.jpg",
    );
  });
});
