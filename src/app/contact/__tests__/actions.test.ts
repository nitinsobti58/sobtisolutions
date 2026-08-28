import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendMessage } from "@/app/contact/actions";
import { contactMessages, initialContactState } from "@/lib/contact-schema";
import { resetThrottle, throttleLimits } from "@/lib/contact-throttle";
import { sendContactMail } from "@/lib/mail";

vi.mock("@/lib/mail", () => ({ sendContactMail: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" })),
}));

const send = vi.mocked(sendContactMail);
const clock = Date.UTC(2026, 7, 27, 12, 0, 0);

const message = "We have a two-family in Toms River and wondered whether you buy.";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const fields = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "",
    message,
    company: "",
    startedAt: String(Date.now() - 10_000),
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ now: clock, toFake: ["Date"] });
  resetThrottle();
  send.mockReset();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
  error.mockRestore();
  vi.useRealTimers();
});

describe("sendMessage", () => {
  it("sends a valid submission and reports it sent", async () => {
    send.mockResolvedValueOnce();
    const state = await sendMessage(initialContactState, form({ name: " Jane Doe " }));
    expect(state).toEqual({ status: "sent" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ name: "Jane Doe", email: "jane@example.com", message });
  });

  it("returns field errors and the typed values without sending", async () => {
    const state = await sendMessage(initialContactState, form({ email: "jane", message: "hi" }));
    expect(state.status).toBe("invalid");
    expect(state.fieldErrors).toEqual({
      email: "Enter a valid email address.",
      message: expect.stringMatching(/at least 10/),
    });
    expect(state.values).toEqual({ name: "Jane Doe", email: "jane", phone: "", message: "hi" });
    expect(state.formError).toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a submission under three seconds with a form-level message", async () => {
    const state = await sendMessage(initialContactState, form({ startedAt: String(Date.now() - 500) }));
    expect(state.status).toBe("invalid");
    expect(state.formError).toBe(contactMessages.tooFast);
    expect(state.fieldErrors).toEqual({});
    expect(send).not.toHaveBeenCalled();
  });

  it("treats a filled honeypot as a failed send, quietly", async () => {
    const state = await sendMessage(initialContactState, form({ company: "Acme" }));
    expect(state.status).toBe("failed");
    expect(state.fieldErrors).toBeUndefined();
    expect(state.values?.message).toBe(message);
    expect(send).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).not.toContain(message);
  });

  it("reports a transport failure without throwing or logging the message", async () => {
    send.mockRejectedValueOnce(
      Object.assign(new Error("Invalid login: 535 Authentication Failed"), {
        code: "EAUTH",
        responseCode: 535,
        command: "AUTH PLAIN",
      }),
    );
    const state = await sendMessage(initialContactState, form());
    expect(state.status).toBe("failed");
    expect(state.values?.name).toBe("Jane Doe");
    expect(error).toHaveBeenCalledTimes(1);
    const logged = String(error.mock.calls[0][0]);
    expect(logged).toContain("EAUTH");
    expect(logged).toContain("535");
    expect(logged).not.toContain(message);
    expect(logged).not.toContain("jane@example.com");
  });

  it("stops sending for a client that has hit the limit, and does not count failures", async () => {
    send.mockRejectedValueOnce(new Error("boom"));
    expect((await sendMessage(initialContactState, form())).status).toBe("failed");
    for (let i = 0; i < throttleLimits.perClient.max; i++) {
      send.mockResolvedValueOnce();
      expect((await sendMessage(initialContactState, form())).status).toBe("sent");
    }
    const state = await sendMessage(initialContactState, form());
    expect(state).toEqual({ status: "failed", values: expect.objectContaining({ name: "Jane Doe" }) });
    expect(send).toHaveBeenCalledTimes(throttleLimits.perClient.max + 1);
    expect(String(warn.mock.calls.at(-1)?.[0])).toMatch(/limit/);
    expect(String(warn.mock.calls.at(-1)?.[0])).not.toContain("203.0.113.5");
  });

  it("never returns anything but plain data", async () => {
    send.mockRejectedValueOnce(new Error("boom"));
    const state = await sendMessage(initialContactState, form());
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});
