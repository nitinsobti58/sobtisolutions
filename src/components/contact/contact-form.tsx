"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendMessage } from "@/app/contact/actions";
import { ctaButtonClass, textLinkClass } from "@/components/layout/cta-link";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  contactLimits,
  initialContactState,
  type ContactField,
  type ContactState,
} from "@/lib/contact-schema";
import { site } from "@/lib/site";

type Props = {
  /** Epoch ms captured by the page at render. The action rejects anything sent less than three seconds later. */
  startedAt: number;
  /** Start from a given state instead of idle, so each state can be rendered directly in tests. */
  initialState?: ContactState;
};

/**
 * Full-strength focus ring with an offset, matching CtaLink; base-nova's half-alpha ring is too faint on Bond.
 * The stacked aria-invalid variants outrank the invalid border rules, so a rejected field still shows focus.
 */
const focusClass =
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:focus-visible:ring-2 aria-invalid:focus-visible:ring-ring";

/**
 * The shadcn Input recipe on a native input, minus the translucent invalid halo (destructive is for the
 * border and the error text only). shadcn's Input wraps a Base UI control that warns whenever defaultValue
 * changes, and the echoed values after a rejected submission do exactly that.
 */
const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-[15px]";

const textareaClass = "min-h-40 px-3 py-2.5 text-base text-foreground aria-invalid:ring-0 md:text-[15px]";

const noticeClass = "border-l-2 border-destructive pl-4 text-[15px] outline-none";

export function ContactForm({ startedAt, initialState = initialContactState }: Props) {
  const [state, formAction, pending] = useActionState(sendMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  // The submit button is disabled while pending, which drops keyboard focus. After a result, put it back
  // where the person needs it: the first rejected field, else the notice, else the confirmation.
  useEffect(() => {
    if (state.status === "idle") return;
    const target =
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      noticeRef.current ??
      sentRef.current;
    target?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div
        ref={sentRef}
        role="status"
        tabIndex={-1}
        className="max-w-[36rem] rounded-lg border border-foreground p-6 outline-none md:p-8"
      >
        <h3 className="font-heading text-lg font-medium">Message sent</h3>
        <p className="mt-2 max-w-[52ch] text-[15px] text-muted-foreground">
          Thank you. We read every message and will reply by email.
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values;

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="relative flex max-w-[36rem] flex-col gap-6"
    >
      <input type="hidden" name="startedAt" value={startedAt} />

      {/* Honeypot: off-screen, out of the tab order, ignored by assistive tech, never autofilled. A person never sees it. */}
      <div aria-hidden="true" className="absolute top-0 -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <TextField
        name="name"
        label="Name"
        autoComplete="name"
        required
        maxLength={contactLimits.name.max}
        defaultValue={values?.name}
        error={errors.name}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={contactLimits.email.max}
        defaultValue={values?.email}
        error={errors.email}
      />
      <TextField
        name="phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        maxLength={contactLimits.phone.max}
        defaultValue={values?.phone}
        error={errors.phone}
      />
      <TextField
        name="message"
        label="Message"
        multiline
        required
        maxLength={contactLimits.message.max}
        defaultValue={values?.message}
        error={errors.message}
      />

      {state.status === "failed" ? (
        <p ref={noticeRef} role="alert" tabIndex={-1} className={noticeClass}>
          We could not send your message. Try again, or email{" "}
          <a href={`mailto:${site.email}`} className={textLinkClass}>
            {site.email}
          </a>
          .
        </p>
      ) : null}
      {state.formError ? (
        <p ref={noticeRef} role="alert" tabIndex={-1} className={noticeClass}>
          {state.formError}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={pending} className={ctaButtonClass}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
      {/* Present from the start so the announcement is reliable; the disabled button cannot announce its own label. */}
      <p role="status" className="sr-only">
        {pending ? "Sending your message." : null}
      </p>
    </form>
  );
}

type TextFieldProps = {
  name: ContactField;
  label: string;
  error?: string;
  defaultValue?: string;
  multiline?: boolean;
  type?: "text" | "email" | "tel";
  inputMode?: "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
};

/**
 * One labelled control. The error, when present, is wired to the control by id; it is read out through
 * the focused control's description rather than as its own alert, so several errors do not talk over each other.
 */
function TextField({
  name,
  label,
  error,
  defaultValue,
  multiline,
  type = "text",
  inputMode,
  ...shared
}: TextFieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  const control = {
    id,
    name,
    defaultValue,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    ...shared,
  };

  return (
    <Field>
      <FieldLabel htmlFor={id} className="font-heading text-sm font-medium">
        {label}
      </FieldLabel>
      {multiline ? (
        <Textarea {...control} rows={6} className={`${textareaClass} ${focusClass}`} />
      ) : (
        <input {...control} type={type} inputMode={inputMode} className={`${inputClass} ${focusClass}`} />
      )}
      <FieldError id={errorId} role={undefined}>
        {error}
      </FieldError>
    </Field>
  );
}
