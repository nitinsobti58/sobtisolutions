import { beforeEach, describe, expect, it } from "vitest";

import { recordSend, resetThrottle, sendAllowed, throttleLimits } from "@/lib/contact-throttle";

const t0 = Date.UTC(2026, 7, 27, 12, 0, 0);

beforeEach(() => resetThrottle());

describe("send throttle", () => {
  it("lets a client send up to the cap inside the window, then stops", () => {
    for (let i = 0; i < throttleLimits.perClient.max; i++) {
      expect(sendAllowed("a", t0 + i)).toBe(true);
      recordSend("a", t0 + i);
    }
    expect(sendAllowed("a", t0 + 1000)).toBe(false);
    expect(sendAllowed("b", t0 + 1000)).toBe(true);
  });

  it("forgets sends once they leave the window", () => {
    for (let i = 0; i < throttleLimits.perClient.max; i++) recordSend("a", t0);
    expect(sendAllowed("a", t0 + throttleLimits.perClient.windowMs - 1)).toBe(false);
    expect(sendAllowed("a", t0 + throttleLimits.perClient.windowMs)).toBe(true);
  });

  it("caps the instance as a whole across clients", () => {
    for (let i = 0; i < throttleLimits.perInstance.max; i++) recordSend(`client-${i}`, t0);
    expect(sendAllowed("someone-new", t0 + 1)).toBe(false);
    expect(sendAllowed("someone-new", t0 + throttleLimits.perInstance.windowMs)).toBe(true);
  });

  it("does not count attempts that were never recorded", () => {
    for (let i = 0; i < 50; i++) expect(sendAllowed("a", t0)).toBe(true);
  });
});
