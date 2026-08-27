"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
};

export function NavLink({ href, className, activeClassName, children }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(className, active && activeClassName)}
    >
      {children}
    </Link>
  );
}
