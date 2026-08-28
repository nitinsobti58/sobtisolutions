import { createTransport } from "nodemailer";
import { describe, expect, it } from "vitest";

import { buildContactMail, MailConfigError, readMailEnv, senderName, smtp } from "@/lib/mail";
import { site } from "@/lib/site";

const env = { user: "sender@sobtisolutions.com", pass: "app-password", to: "info@sobtisolutions.com" };

const message = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "We have a two-family in Toms River and wondered whether you buy.",
};

/** Render through nodemailer without a network, and return the header block and body separately. */
async function render(mail: ReturnType<typeof buildContactMail>) {
  const transport = createTransport({ streamTransport: true, newline: "unix", buffer: true });
  const info = await transport.sendMail(mail);
  const raw = (info.message as Buffer).toString("utf8");
  const [headers, ...body] = raw.split("\n\n");
  return { headers, body: body.join("\n\n"), envelope: info.envelope };
}

describe("readMailEnv", () => {
  it("returns the three variables, trimmed", () => {
    expect(
      readMailEnv({ CONTACT_SMTP_USER: ` ${env.user} `, CONTACT_SMTP_PASS: env.pass, CONTACT_TO: env.to }),
    ).toEqual(env);
  });

  it("throws a typed error naming the first missing variable", () => {
    expect(() => readMailEnv({})).toThrow(MailConfigError);
    expect(() => readMailEnv({})).toThrow("CONTACT_SMTP_USER");
    let caught: unknown;
    try {
      readMailEnv({ CONTACT_SMTP_USER: env.user, CONTACT_SMTP_PASS: "   " });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(MailConfigError);
    expect((caught as MailConfigError).variable).toBe("CONTACT_SMTP_PASS");
    expect(() => readMailEnv({ CONTACT_SMTP_USER: env.user, CONTACT_SMTP_PASS: env.pass })).toThrow("CONTACT_TO");
  });
});

describe("buildContactMail", () => {
  it("sends from the authenticated mailbox under the site's display name", () => {
    expect(senderName).toBe("Sobti Solutions Website");
    expect(buildContactMail(message, env).from).toEqual({ name: senderName, address: env.user });
  });

  it("delivers to CONTACT_TO with the submitter in Reply-To", () => {
    const mail = buildContactMail({ ...message, phone: "732-555-0100" }, env);
    expect(mail.to).toBe(env.to);
    expect(mail.replyTo).toEqual({ name: message.name, address: message.email });
    expect(mail.subject).toBe("Website message from Jane Doe");
    expect(mail.text).toContain("Name: Jane Doe");
    expect(mail.text).toContain("Email: jane@example.com");
    expect(mail.text).toContain("Phone: 732-555-0100");
    expect(mail.text).toContain(message.message);
    expect(mail.text).toContain(`${site.url}/contact`);
  });

  it("leaves the phone line out when there is no phone", () => {
    expect(buildContactMail(message, env).text).not.toContain("Phone:");
  });

  it("never lets user input into From, whatever it looks like", () => {
    const mail = buildContactMail(
      { ...message, name: "Mallory <mallory@example.com>", email: "mallory@example.com" },
      env,
    );
    expect(mail.from).toEqual({ name: senderName, address: env.user });
  });

  it("pins the Zoho SMTP settings the plan calls for", () => {
    expect(smtp).toMatchObject({ host: "smtppro.zoho.com", port: 465, secure: true });
    expect(smtp.timeoutMs).toBeLessThanOrEqual(10_000);
  });
});

describe("rendered message", () => {
  it("puts the right addresses on the wire", async () => {
    const { headers, envelope } = await render(buildContactMail(message, env));
    expect(headers).toMatch(/^From: "?Sobti Solutions Website"? <sender@sobtisolutions\.com>$/m);
    expect(headers).toMatch(/^To: info@sobtisolutions\.com$/m);
    expect(headers).toMatch(/^Reply-To: "?Jane Doe"? <jane@example\.com>$/m);
    expect(headers).toMatch(/^Subject: Website message from Jane Doe$/m);
    expect(envelope).toEqual({ from: env.user, to: [env.to] });
  });

  it("cannot be used to add headers even if a newline got through", async () => {
    const { headers } = await render(
      buildContactMail({ ...message, name: "Jane\r\nBcc: victim@example.com" }, env),
    );
    expect(headers).not.toMatch(/^Bcc:/m);
    expect(headers).toMatch(/^From: "?Sobti Solutions Website"? <sender@sobtisolutions\.com>$/m);
  });
});
