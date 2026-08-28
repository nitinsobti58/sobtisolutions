"use client";

import { ctaButtonClass, textLinkClass } from "@/components/layout/cta-link";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

/** If the page or a submission crashes, the email address must still be on screen. */
export default function ContactError({ retry }: Props) {
  return (
    <main className="wrap flex flex-1 flex-col items-start gap-6 py-16 md:py-24">
      <h1 className="font-heading text-4xl leading-[1.08] font-medium tracking-[-0.015em] md:text-5xl">
        Something went wrong
      </h1>
      <p className="max-w-[52ch] text-[19px] leading-normal text-pretty">
        The contact page hit an error. Try again, or email{" "}
        <a href={`mailto:${site.email}`} className={textLinkClass}>
          {site.email}
        </a>
        .
      </p>
      <Button size="lg" onClick={() => retry()} className={ctaButtonClass}>
        Try again
      </Button>
    </main>
  );
}
