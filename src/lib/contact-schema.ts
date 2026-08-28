import { z } from "zod";

/** Field caps. The schema, the inputs' maxLength attributes, and the tests all read from here. */
export const contactLimits = {
  name: { min: 1, max: 100 },
  email: { max: 254 },
  phone: { max: 40 },
  message: { min: 10, max: 4000 },
} as const;

/** A submission must arrive at least this long after the page rendered. */
export const minSubmitMs = 3000;

/** No page rendered before the site existed, so an earlier startedAt was not set by this site. */
const earliestRender = Date.UTC(2026, 7, 1);

export const contactFields = ["name", "email", "phone", "message"] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactFieldErrors = Partial<Record<ContactField, string>>;
export type ContactValues = Record<ContactField, string>;

export type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export type ContactStatus = "idle" | "sent" | "invalid" | "failed";

/** What the Server Action returns and the form renders. Plain data only; it crosses to the client. */
export type ContactState = {
  status: ContactStatus;
  fieldErrors?: ContactFieldErrors;
  /** A problem with the submission as a whole, not one field (the time trap). */
  formError?: string;
  /** What was typed, echoed back so a rejected submission keeps its text after React resets the form. */
  values?: ContactValues;
};

export const initialContactState: ContactState = { status: "idle" };

export const contactMessages = {
  tooFast: "That was quick. Take another look and send it again.",
  stale: "The form did not load properly. Reload the page and try again.",
} as const;

const singleLine = (value: string) => !/[\r\n]/.test(value);

/** Built per call so the time trap compares against the caller's clock. */
export function contactSchema(now: number) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(contactLimits.name.min, "Enter your name.")
      .max(contactLimits.name.max, `Keep your name under ${contactLimits.name.max} characters.`)
      .refine(singleLine, "Keep your name on one line."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .max(contactLimits.email.max, `Keep your email address under ${contactLimits.email.max} characters.`)
      // zod's default pattern is ASCII-only; internationalised addresses are out of scope for this audience.
      .pipe(z.email("Enter a valid email address.")),
    phone: z
      .string()
      .trim()
      .max(contactLimits.phone.max, `Keep the phone number under ${contactLimits.phone.max} characters.`)
      .refine(singleLine, "Keep the phone number on one line."),
    message: z
      .string()
      .trim()
      .min(1, "Enter a message.")
      .min(contactLimits.message.min, `Say a little more: at least ${contactLimits.message.min} characters.`)
      .max(
        contactLimits.message.max,
        `Keep your message under ${contactLimits.message.max.toLocaleString("en-US")} characters.`,
      ),
    // Honeypot. People never see this field, so anything in it came from a script.
    company: z.string().max(0),
    // Time trap. Set by the server when the page rendered; a form filled in under three seconds was not filled by a person.
    startedAt: z
      .string()
      .regex(/^\d{1,15}$/, contactMessages.stale)
      .transform(Number)
      .refine((value) => value >= earliestRender && value <= now, contactMessages.stale)
      .refine((value) => now - value >= minSubmitMs, contactMessages.tooFast),
  });
}

export type ContactParseResult =
  | { ok: true; data: ContactMessage }
  | { ok: false; reason: "honeypot" }
  | { ok: false; reason: "invalid"; fieldErrors: ContactFieldErrors; formError?: string };

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** The raw strings as typed, for echoing back to the form. Never used for sending. */
export function readContactValues(formData: FormData): ContactValues {
  return {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    message: text(formData, "message"),
  };
}

/** Validate a submission. Reads only the known fields, so nothing else in the FormData is ever looked at. */
export function parseContactForm(formData: FormData, now = Date.now()): ContactParseResult {
  const parsed = contactSchema(now).safeParse({
    ...readContactValues(formData),
    company: text(formData, "company"),
    startedAt: text(formData, "startedAt"),
  });

  if (parsed.success) {
    const { name, email, phone, message } = parsed.data;
    return { ok: true, data: phone ? { name, email, phone, message } : { name, email, message } };
  }

  const flat = z.flattenError(parsed.error);
  if (flat.fieldErrors.company?.length) {
    return { ok: false, reason: "honeypot" };
  }

  const fieldErrors: ContactFieldErrors = {};
  for (const field of contactFields) {
    const first = flat.fieldErrors[field]?.[0];
    if (first) fieldErrors[field] = first;
  }
  const formError = flat.fieldErrors.startedAt?.[0];
  return formError
    ? { ok: false, reason: "invalid", fieldErrors, formError }
    : { ok: false, reason: "invalid", fieldErrors };
}
