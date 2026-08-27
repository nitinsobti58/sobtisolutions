import Link from "next/link";

import { textLinkClass } from "@/components/layout/cta-link";
import { nav } from "@/components/layout/header";
import { site } from "@/lib/site";

const label =
  "font-heading text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="wrap py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* TODO: confirm the exact registered LLC name and state of formation. */}
          <dl className="grid max-w-xs grid-cols-2 gap-px border border-border bg-border text-sm">
            <div className="bg-background px-4 py-3">
              <dt className={label}>Entity</dt>
              <dd className="mt-1 font-heading font-medium">{site.legalName}</dd>
            </div>
            <div className="bg-background px-4 py-3">
              <dt className={label}>Formed</dt>
              <dd className="mt-1 font-heading font-medium">{site.stateOfFormation}</dd>
            </div>
          </dl>

          <nav aria-label="Footer" className="flex flex-col items-start gap-2 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={textLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-2 text-sm">
            <a href={`mailto:${site.email}`} className={textLinkClass}>
              {site.email}
            </a>
          </div>
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          © {year} {site.legalName}
        </p>
      </div>
    </footer>
  );
}
