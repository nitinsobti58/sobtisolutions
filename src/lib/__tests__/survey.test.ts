import { describe, expect, it } from "vitest";

import {
  bearing,
  distanceFeet,
  hash32,
  labelAngle,
  seededParcel,
} from "@/lib/survey";

const o = { x: 0, y: 0 };

describe("bearing", () => {
  it("reads north as N 0° E and east as N 90° E (SVG y grows downward)", () => {
    expect(bearing(o, { x: 0, y: -10 })).toBe(`N 0°00'00" E`);
    expect(bearing(o, { x: 10, y: 0 })).toBe(`N 90°00'00" E`);
  });

  it("uses the right quadrant for every direction", () => {
    expect(bearing(o, { x: 10, y: 10 })).toBe(`S 45°00'00" E`);
    expect(bearing(o, { x: -10, y: 10 })).toBe(`S 45°00'00" W`);
    expect(bearing(o, { x: -10, y: -10 })).toBe(`N 45°00'00" W`);
  });

  it("rounds to minutes when asked", () => {
    expect(bearing(o, { x: 10, y: -10 }, "minutes")).toBe(`N 45°00' E`);
    expect(bearing(o, { x: 1, y: -100 }, "minutes")).toBe(`N 0°34' E`);
  });
});

describe("distanceFeet", () => {
  it("scales the drawn length to feet with two decimals", () => {
    expect(distanceFeet(o, { x: 100, y: 0 })).toBe("60.00");
    expect(distanceFeet(o, { x: 3, y: 4 }, 1)).toBe("5.00");
  });
});

describe("labelAngle", () => {
  it("never leaves a label upside down", () => {
    expect(labelAngle(o, { x: 10, y: 0 })).toBe(0);
    expect(labelAngle(o, { x: -10, y: 0 })).toBe(0);
    expect(labelAngle(o, { x: -10, y: -10 })).toBe(45);
    expect(labelAngle(o, { x: 0, y: 10 })).toBe(90);
  });
});

describe("hash32 and seededParcel", () => {
  it("is deterministic and distinguishes seeds", () => {
    expect(hash32("placeholder-two-family")).toBe(hash32("placeholder-two-family"));
    expect(hash32("a")).not.toBe(hash32("b"));
  });

  it("draws the same six-course parcel for the same seed and a different one otherwise", () => {
    const rect = { left: 40, top: 30, width: 280, height: 186 };
    const a = seededParcel("alpha", rect);
    const b = seededParcel("alpha", rect);
    const c = seededParcel("beta", rect);
    expect(a).toHaveLength(6);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("stays inside the frame with room for labels", () => {
    const rect = { left: 40, top: 30, width: 280, height: 186 };
    for (const seed of ["one", "two", "three", "placeholder-condo"]) {
      for (const p of seededParcel(seed, rect)) {
        expect(p.x).toBeGreaterThan(20);
        expect(p.x).toBeLessThan(340);
        expect(p.y).toBeGreaterThan(10);
        expect(p.y).toBeLessThan(240);
      }
    }
  });
});
