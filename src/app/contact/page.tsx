import type { Metadata } from "next";

import { CtaLink, textLinkClass } from "@/components/layout/cta-link";
import { TitleBlock } from "@/components/layout/title-block";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write to Sobti Solutions LLC at ${site.email} about a property, a lease, or a question.`,
};

export default function ContactPage() {
  return (
    <main className="wrap flex flex-1 flex-col gap-12 py-16 md:gap-16 md:py-24">
      <section className="flex flex-col gap-6">
        <h1 className="font-heading text-4xl leading-[1.08] font-medium tracking-[-0.015em] md:text-5xl">
          Contact
        </h1>
        <p className="max-w-[52ch] text-[19px] leading-normal text-pretty">
          Have a property, or a question about one of ours? Write to us. One of
          the three of us reads every message.
        </p>
      </section>

      {/* TODO (Phase 4): the message form lands here. The email line below stays visible in every state. */}
      <section className="flex flex-col gap-6" aria-labelledby="write-heading">
        <h2 id="write-heading" className="sr-only">
          Write to us
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <CtaLink href={`mailto:${site.email}`}>Email {site.email}</CtaLink>
          <span className="text-[15px] text-muted-foreground">
            or copy it:{" "}
            <a href={`mailto:${site.email}`} className={`${textLinkClass} text-foreground`}>
              {site.email}
            </a>
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="details-heading">
        <h2 id="details-heading" className="font-heading text-2xl font-medium tracking-[-0.01em] md:text-[28px]">
          Company details
        </h2>
        {/* TODO: confirm the exact registered LLC name and state of formation. */}
        <TitleBlock
          columns={4}
          items={[
            { label: "Entity", value: site.legalName },
            { label: "Formed", value: site.stateOfFormation },
            { label: "Area served", value: site.areaServed },
            { label: "Email", value: site.email },
          ]}
        />
      </section>
    </main>
  );
}
