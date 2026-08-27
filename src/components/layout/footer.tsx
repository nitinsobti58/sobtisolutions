import Link from "next/link";

import { textLinkClass } from "@/components/layout/cta-link";
import { nav } from "@/components/layout/header";
import { TitleBlock } from "@/components/layout/title-block";
import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="wrap py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* TODO: confirm the exact registered LLC name and state of formation. */}
          <TitleBlock
            size="sm"
            columns={2}
            className="max-w-xs"
            items={[
              { label: "Entity", value: site.legalName },
              { label: "Formed", value: site.stateOfFormation },
            ]}
          />

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
