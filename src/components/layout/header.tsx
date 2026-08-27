import Link from "next/link";

import { NavLink } from "@/components/layout/nav-link";
import { site } from "@/lib/site";

export const nav = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-heading text-base font-semibold tracking-[-0.01em] whitespace-nowrap text-foreground sm:text-xl"
        >
          {site.name}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 sm:gap-8">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline hover:decoration-1 hover:decoration-border sm:text-[15px]"
              activeClassName="underline decoration-1 decoration-foreground"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
