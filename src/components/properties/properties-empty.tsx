import { Traverse } from "@/components/brand/traverse";
import { textLinkClass } from "@/components/layout/cta-link";
import { site } from "@/lib/site";

/** The card frame at full width, with no inventory behind it. A real state, not a stub. */
export function PropertiesEmpty() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="relative aspect-[3/1] border-b border-border">
        <div className="mx-auto h-full max-w-md">
          <Traverse variant="card" seed="portfolio-details-to-follow" />
        </div>
        <p className="absolute bottom-3 left-4 font-heading text-[11px] leading-4 font-medium tracking-[0.06em] uppercase text-muted-foreground">
          Sheet 1 of 1
          <br />
          Not to scale
        </p>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h2 className="font-heading text-lg font-medium">Portfolio details to follow</h2>
        <p className="max-w-[52ch] text-[15px] text-muted-foreground">
          We are preparing the listing. For current holdings, write to{" "}
          <a href={`mailto:${site.email}`} className={textLinkClass}>
            {site.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
