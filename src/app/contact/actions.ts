"use server";

import { headers } from "next/headers";

import { parseContactForm, readContactValues, type ContactState } from "@/lib/contact-schema";
import { recordSend, sendAllowed } from "@/lib/contact-throttle";
import { sendContactMail } from "@/lib/mail";

/** What gets logged when a send fails: the error's kind and SMTP codes, never the message. */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const smtp = error as Error & { code?: string; responseCode?: number; command?: string };
  return [error.name, smtp.code, smtp.responseCode, smtp.command, error.message]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
}

/** The client's address as the platform reports it, for the send throttle only. Never logged. */
async function clientKey(): Promise<string> {
  const incoming = await headers();
  const forwarded = incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || incoming.get("x-real-ip")?.trim() || "unknown";
}

/**
 * The contact form's Server Action. Every path returns a state; nothing throws to the client.
 * A filled honeypot is treated as a failed send: no mail goes out, and a person whose browser
 * autofilled the hidden field is pointed at the email address instead of shown a false success.
 */
export async function sendMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const values = readContactValues(formData);
  const result = parseContactForm(formData);

  if (!result.ok) {
    if (result.reason === "honeypot") {
      console.warn("[contact] Rejected a submission: honeypot filled.");
      return { status: "failed", values };
    }
    return {
      status: "invalid",
      fieldErrors: result.fieldErrors,
      ...(result.formError ? { formError: result.formError } : {}),
      values,
    };
  }

  const client = await clientKey();
  if (!sendAllowed(client)) {
    console.warn("[contact] Rejected a submission: send limit reached.");
    return { status: "failed", values };
  }

  try {
    await sendContactMail(result.data);
    recordSend(client);
    return { status: "sent" };
  } catch (error) {
    console.error(`[contact] Send failed: ${describeError(error)}`);
    return { status: "failed", values };
  }
}
