import { describe, expect, it } from "vitest";

import {
  contactLimits,
  contactMessages,
  minSubmitMs,
  parseContactForm,
  readContactValues,
  type ContactParseResult,
} from "@/lib/contact-schema";

const now = Date.UTC(2026, 7, 27, 12, 0, 0);

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "",
  message: "We have a two-family in Toms River and wondered whether you buy.",
  company: "",
  startedAt: String(now - 10_000),
};

function form(overrides: Partial<Record<keyof typeof valid, string | Blob>> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...valid, ...overrides })) data.set(key, value);
  return data;
}

type Rejected = Extract<ContactParseResult, { ok: false }>;
type Invalid = Extract<Rejected, { reason: "invalid" }>;

function accepted(data: FormData) {
  const result = parseContactForm(data, now);
  expect(result.ok).toBe(true);
  return (result as Extract<ContactParseResult, { ok: true }>).data;
}

function rejected(data: FormData): Rejected {
  const result = parseContactForm(data, now);
  expect(result.ok).toBe(false);
  return result as Rejected;
}

function invalid(data: FormData): Invalid {
  const result = rejected(data);
  expect(result.reason).toBe("invalid");
  return result as Invalid;
}

describe("parseContactForm accepts", () => {
  it("a complete submission, trimmed, with the phone omitted when blank", () => {
    expect(accepted(form({ name: "  Jane Doe ", email: " jane@example.com " }))).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      message: valid.message,
    });
  });

  it("an optional phone", () => {
    expect(accepted(form({ phone: " 732-555-0100 " })).phone).toBe("732-555-0100");
  });

  it("values exactly at the caps", () => {
    const data = accepted(
      form({
        name: "n".repeat(contactLimits.name.max),
        message: "m".repeat(contactLimits.message.max),
        phone: "1".repeat(contactLimits.phone.max),
      }),
    );
    expect(data.name).toHaveLength(contactLimits.name.max);
    expect(data.message).toHaveLength(contactLimits.message.max);
    expect(accepted(form({ message: "m".repeat(contactLimits.message.min) })).message).toHaveLength(
      contactLimits.message.min,
    );
  });

  it("a submission exactly three seconds after render", () => {
    accepted(form({ startedAt: String(now - minSubmitMs) }));
  });
});

describe("name", () => {
  it("is required", () => {
    expect(invalid(form({ name: "" })).fieldErrors.name).toBe("Enter your name.");
    expect(invalid(form({ name: "   " })).fieldErrors.name).toBe("Enter your name.");
  });

  it("is capped", () => {
    expect(invalid(form({ name: "n".repeat(contactLimits.name.max + 1) })).fieldErrors.name).toMatch(/under 100/);
  });

  it("is one line", () => {
    expect(invalid(form({ name: "Jane\r\nBcc: someone@example.com" })).fieldErrors.name).toMatch(/one line/);
  });
});

describe("email", () => {
  it("is required", () => {
    expect(invalid(form({ email: "" })).fieldErrors.email).toBe("Enter your email address.");
  });

  it("must be an address", () => {
    for (const bad of ["jane", "jane@", "@example.com", "jane@example", "jane doe@example.com", "jane@exa mple.com"]) {
      expect(invalid(form({ email: bad })).fieldErrors.email, bad).toBe("Enter a valid email address.");
    }
  });

  it("is capped", () => {
    const long = `${"j".repeat(contactLimits.email.max)}@example.com`;
    expect(invalid(form({ email: long })).fieldErrors.email).toMatch(/under 254/);
  });
});

describe("phone", () => {
  it("is capped and one line", () => {
    expect(invalid(form({ phone: "1".repeat(contactLimits.phone.max + 1) })).fieldErrors.phone).toMatch(/under 40/);
    expect(invalid(form({ phone: "555\n0100" })).fieldErrors.phone).toMatch(/one line/);
  });
});

describe("message", () => {
  it("is required", () => {
    expect(invalid(form({ message: "" })).fieldErrors.message).toBe("Enter a message.");
    expect(invalid(form({ message: "\n\n  " })).fieldErrors.message).toBe("Enter a message.");
  });

  it("has a floor and a cap", () => {
    expect(invalid(form({ message: "m".repeat(contactLimits.message.min - 1) })).fieldErrors.message).toMatch(
      /at least 10/,
    );
    expect(invalid(form({ message: "m".repeat(contactLimits.message.max + 1) })).fieldErrors.message).toMatch(
      /under 4,000/,
    );
  });
});

describe("honeypot", () => {
  it("rejects a filled company field", () => {
    expect(rejected(form({ company: "Acme" })).reason).toBe("honeypot");
  });

  it("takes precedence over every other problem", () => {
    expect(rejected(form({ company: "Acme", name: "", startedAt: String(now) })).reason).toBe("honeypot");
  });
});

describe("time trap", () => {
  it("rejects a form sent under three seconds after render", () => {
    const result = invalid(form({ startedAt: String(now - minSubmitMs + 1) }));
    expect(result.formError).toBe(contactMessages.tooFast);
    expect(result.fieldErrors).toEqual({});
  });

  it("rejects a render time in the future", () => {
    expect(invalid(form({ startedAt: String(now + 1) })).formError).toBe(contactMessages.stale);
  });

  it("rejects a render time from before the site existed", () => {
    expect(invalid(form({ startedAt: "0" })).formError).toBe(contactMessages.stale);
    expect(invalid(form({ startedAt: String(Date.UTC(2020, 0, 1)) })).formError).toBe(contactMessages.stale);
  });

  it("rejects a missing or malformed render time", () => {
    const missing = form();
    missing.delete("startedAt");
    expect(invalid(missing).formError).toBe(contactMessages.stale);
    expect(invalid(form({ startedAt: "" })).formError).toBe(contactMessages.stale);
    expect(invalid(form({ startedAt: "soon" })).formError).toBe(contactMessages.stale);
    expect(invalid(form({ startedAt: "1.5e12" })).formError).toBe(contactMessages.stale);
  });

  it("reports field errors alongside the time trap", () => {
    const result = invalid(form({ name: "", startedAt: String(now) }));
    expect(result.formError).toBe(contactMessages.tooFast);
    expect(result.fieldErrors.name).toBe("Enter your name.");
  });
});

describe("shape", () => {
  it("reports only the first problem per field and only for visible fields", () => {
    const result = invalid(form({ name: "", email: "", message: "", phone: "", startedAt: String(now) }));
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "message", "name"]);
    expect(result.fieldErrors.message).toBe("Enter a message.");
  });

  it("treats file uploads in text fields as empty", () => {
    expect(invalid(form({ name: new Blob(["x"]) })).fieldErrors.name).toBe("Enter your name.");
  });

  it("omits formError when the timing is fine", () => {
    expect("formError" in invalid(form({ name: "" }))).toBe(false);
  });
});

describe("readContactValues", () => {
  it("echoes the four visible fields as typed, and nothing else", () => {
    expect(readContactValues(form({ name: "  Jane ", company: "Acme" }))).toEqual({
      name: "  Jane ",
      email: valid.email,
      phone: "",
      message: valid.message,
    });
  });
});
