import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Inline links are always underlined; color alone is not enough contrast against ink. */
export const textLinkClass =
  "underline decoration-1 decoration-border underline-offset-4 transition-colors hover:decoration-primary";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

/** The primary action. A full-strength focus ring with an offset replaces the default half-alpha ring. */
export function CtaLink({ href, className, children }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-10 px-5 font-heading text-[15px] font-medium hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </Link>
  );
}
