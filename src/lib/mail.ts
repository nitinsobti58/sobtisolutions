import "server-only";

import { createTransport } from "nodemailer";

import type { ContactMessage } from "@/lib/contact-schema";
import { site } from "@/lib/site";

export const mailEnvNames = ["CONTACT_SMTP_USER", "CONTACT_SMTP_PASS", "CONTACT_TO"] as const;
export type MailEnvName = (typeof mailEnvNames)[number];

export type MailEnv = {
  /** The Zoho mailbox that authenticates. It is also the From address, or DMARC fails. */
  user: string;
  /** A Zoho app-specific password for that mailbox. */
  pass: string;
  /** Where messages land. */
  to: string;
};

/** A required variable is unset. Carries the variable name and nothing else. */
export class MailConfigError extends Error {
  readonly variable: MailEnvName;

  constructor(variable: MailEnvName) {
    super(`Missing environment variable ${variable}`);
    this.name = "MailConfigError";
    this.variable = variable;
  }
}

type MailEnvSource = Readonly<Record<string, string | undefined>>;

/** Read at call time, not at import, so variables added to a running deployment take effect without a rebuild. */
export function readMailEnv(env: MailEnvSource = process.env): MailEnv {
  const read = (name: MailEnvName) => {
    const value = env[name]?.trim();
    if (!value) throw new MailConfigError(name);
    return value;
  };
  return { user: read("CONTACT_SMTP_USER"), pass: read("CONTACT_SMTP_PASS"), to: read("CONTACT_TO") };
}

export const smtp = {
  host: "smtppro.zoho.com",
  port: 465,
  secure: true,
  /** Applied to DNS, connect, greeting, and socket idle. A hung submit button is worse than a failure state. */
  timeoutMs: 10_000,
} as const;

export const senderName = `${site.name} Website`;

/**
 * The envelope. From is always the authenticated mailbox under a fixed display name;
 * the person writing in appears only in Reply-To, the subject, and the body.
 */
export function buildContactMail(message: ContactMessage, env: MailEnv) {
  const lines = [`Name: ${message.name}`, `Email: ${message.email}`];
  if (message.phone) lines.push(`Phone: ${message.phone}`);
  lines.push("", "Message:", message.message, "", "--", `Sent from the contact form at ${site.url}/contact`);

  return {
    from: { name: senderName, address: env.user },
    to: env.to,
    replyTo: { name: message.name, address: message.email },
    subject: `Website message from ${message.name}`,
    text: lines.join("\n"),
  };
}

/** Send one contact message through Zoho SMTP. Throws MailConfigError or the transport's error. */
export async function sendContactMail(message: ContactMessage): Promise<void> {
  const env = readMailEnv();
  const transport = createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: env.user, pass: env.pass },
    dnsTimeout: smtp.timeoutMs,
    connectionTimeout: smtp.timeoutMs,
    greetingTimeout: smtp.timeoutMs,
    socketTimeout: smtp.timeoutMs,
  });
  try {
    await transport.sendMail(buildContactMail(message, env));
  } finally {
    transport.close();
  }
}
