import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Inline links are always underlined, in a color that clears 3:1 on every surface; the underline turns Bay on hover. */
export const textLinkClass =
  "underline decoration-1 decoration-muted-foreground underline-offset-4 transition-colors hover:decoration-primary";

/** The site's one button: 40px, Archivo 500 15px, Bay with a darker hover, and a full-strength focus ring. */
export const ctaButtonClass =
  "h-10 px-5 font-heading text-[15px] font-medium hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type Props = {
  href: string;
  variant?: "default" | "outline";
  className?: string;
  children: React.ReactNode;
};

/** Link styled as a button. A full-strength 2px focus ring with an offset replaces the default half-alpha ring. */
export function CtaLink({ href, variant = "default", className, children }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size: "lg" }),
        ctaButtonClass,
        variant === "outline" && "hover:bg-muted",
        className,
      )}
    >
      {children}
    </Link>
  );
}
