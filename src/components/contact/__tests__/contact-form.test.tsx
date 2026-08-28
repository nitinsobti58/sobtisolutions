// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/contact/contact-form";
import { contactMessages, type ContactState } from "@/lib/contact-schema";
import { site } from "@/lib/site";

vi.mock("@/app/contact/actions", () => ({ sendMessage: vi.fn() }));

const startedAt = Date.UTC(2026, 7, 27, 12, 0, 0);

const values = {
  name: "Jane Doe",
  email: "jane@example",
  phone: "732-555-0100",
  message: "We have a two-family in Toms River and wondered whether you buy.",
};

function renderState(initialState?: ContactState) {
  return render(<ContactForm startedAt={startedAt} initialState={initialState} />);
}

describe("ContactForm at rest", () => {
  it("labels the four fields and offers to send", () => {
    renderState();
    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Phone (optional)")).not.toBeRequired();
    expect(screen.getByLabelText("Message").tagName).toBe("TEXTAREA");
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("carries the render time in a hidden field", () => {
    const { container } = renderState();
    const input = container.querySelector<HTMLInputElement>('input[name="startedAt"]');
    expect(input?.type).toBe("hidden");
    expect(input?.value).toBe(String(startedAt));
  });

  it("hides the honeypot from people without display:none", () => {
    const { container } = renderState();
    const honeypot = container.querySelector<HTMLInputElement>('input[name="company"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot?.value).toBe("");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot?.closest("[hidden]")).toBeNull();
    expect(honeypot?.parentElement).toHaveClass("-left-[10000px]");
    expect(honeypot?.parentElement).not.toHaveClass("hidden");
    expect(screen.queryByRole("textbox", { name: "Company" })).not.toBeInTheDocument();
  });

  it("caps input length in the browser to match the schema", () => {
    renderState();
    expect(screen.getByLabelText("Name")).toHaveAttribute("maxlength", "100");
    expect(screen.getByLabelText("Message")).toHaveAttribute("maxlength", "4000");
  });
});

describe("ContactForm after a rejected submission", () => {
  it("shows each field's error, wires it to the control, and keeps what was typed", () => {
    renderState({
      status: "invalid",
      fieldErrors: { email: "Enter a valid email address." },
      values,
    });
    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    const errorId = email.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent("Enter a valid email address.");
    expect(document.getElementById(errorId!)).not.toHaveAttribute("role");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Name")).toHaveValue(values.name);
    expect(email).toHaveValue(values.email);
    expect(screen.getByLabelText("Phone (optional)")).toHaveValue(values.phone);
    expect(screen.getByLabelText("Message")).toHaveValue(values.message);
    expect(email).toHaveFocus();
  });

  it("shows the time-trap message as a form-level alert", () => {
    renderState({ status: "invalid", fieldErrors: {}, formError: contactMessages.tooFast, values });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(contactMessages.tooFast);
    expect(alert).toHaveFocus();
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });
});

describe("ContactForm after a failed send", () => {
  it("keeps the form, keeps the text, and points at the email address", () => {
    renderState({ status: "failed", values });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/could not send/i);
    expect(alert).toHaveFocus();
    expect(alert.querySelector("a")).toHaveAttribute("href", `mailto:${site.email}`);
    expect(screen.getByLabelText("Message")).toHaveValue(values.message);
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });
});

describe("ContactForm after a successful send", () => {
  it("replaces the form with a confirmation", () => {
    const { container } = renderState({ status: "sent" });
    expect(screen.getByRole("status")).toHaveTextContent("Message sent");
    expect(screen.getByRole("status")).toHaveFocus();
    expect(container.querySelector("form")).toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
