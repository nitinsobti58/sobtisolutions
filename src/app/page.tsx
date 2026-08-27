import Link from "next/link";

import { Traverse } from "@/components/brand/traverse";
import { CtaLink, textLinkClass } from "@/components/layout/cta-link";
import { PropertyCard } from "@/components/properties/property-card";
import { featuredProperties } from "@/data/properties";
import { site } from "@/lib/site";

// TODO: placeholder copy pending owner review (audience emphasis and property-type wording).
const trust = [
  { label: "Area served", value: site.areaServed },
  { label: "Ownership", value: "Family-owned, three principals" },
  { label: "What we hold", value: "Small residential buildings" },
  { label: "How we work", value: "We manage what we own" },
];

const caps =
  "font-heading text-xs font-medium tracking-[0.06em] uppercase text-muted-foreground";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="wrap grid gap-10 pt-16 pb-[72px] md:grid-cols-12 md:gap-6 md:pt-24 md:pb-28">
        <div className="reveal flex flex-col items-start gap-6 md:col-span-7">
          <p className={`${caps} leading-5`}>
            {site.legalName}
            <br />
            {site.areaServed}
          </p>
          <h1 className="max-w-[22ch] font-heading text-4xl leading-[1.08] font-medium tracking-[-0.015em] text-balance md:text-[52px]">
            We buy and hold property in Ocean County, New Jersey.
          </h1>
          <p className="max-w-[52ch] text-[19px] leading-normal text-pretty">
            Sobti Solutions is a family-owned holding company: we buy small
            residential buildings in Toms River and the towns around Barnegat
            Bay, keep them in good repair, and manage what we own ourselves.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <CtaLink href="/contact">Send a message</CtaLink>
            <Link href="/properties" className={textLinkClass}>
              See the properties
            </Link>
          </div>
        </div>
        <div className="reveal reveal-late md:col-span-5 md:self-center">
          <Traverse variant="hero" />
        </div>
      </section>

      <section className="wrap" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="sr-only">
          At a glance
        </h2>
        <dl className="grid grid-cols-2 gap-px border border-foreground bg-border md:grid-cols-4">
          {trust.map((item) => (
            <div key={item.label} className="bg-background px-5 py-5 md:px-6">
              <dt className={caps}>{item.label}</dt>
              <dd className="mt-1 font-heading text-lg leading-tight font-medium tabular-nums text-balance md:text-[22px]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 bg-muted py-16 md:mt-24 md:py-24" aria-labelledby="featured-heading">
        <div className="wrap">
          <div className="flex items-baseline justify-between gap-6">
            <h2 id="featured-heading" className="font-heading text-2xl font-medium tracking-[-0.01em] md:text-[28px]">
              Featured properties
            </h2>
            <Link href="/properties" className={textLinkClass}>
              All properties
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredProperties.slice(0, 3).map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-16 md:py-24" aria-labelledby="cta-heading">
        <div className="relative rounded-lg border border-foreground p-8 md:p-12">
          <h2 id="cta-heading" className="max-w-[24ch] font-heading text-[28px] leading-tight font-medium tracking-[-0.01em] text-balance md:text-[32px]">
            Have a property, or a question about one of ours?
          </h2>
          <p className="mt-4 max-w-[52ch] text-[17px]">
            Write to us. One of the three of us reads every message.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <CtaLink href="/contact">Send a message</CtaLink>
            <a href={`mailto:${site.email}`} className={textLinkClass}>
              or email {site.email}
            </a>
          </div>
          <p aria-hidden="true" className="absolute right-6 bottom-4 hidden text-right font-heading text-[11px] leading-4 font-medium tracking-[0.06em] uppercase text-muted-foreground md:block">
            Contact
            <br />
            {site.legalName}
          </p>
        </div>
      </section>
    </main>
  );
}
