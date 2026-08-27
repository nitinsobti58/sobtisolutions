import { CtaLink } from "@/components/layout/cta-link";

export default function NotFound() {
  return (
    <main className="wrap flex flex-1 flex-col items-start justify-center gap-4 py-24">
      <p className="font-heading text-xs font-medium tracking-[0.06em] uppercase text-muted-foreground">
        404
      </p>
      <h1 className="font-heading text-3xl font-medium tracking-[-0.015em]">Page not found</h1>
      <p className="text-muted-foreground">That page doesn&apos;t exist or has moved.</p>
      <CtaLink href="/" variant="outline">
        Back to the homepage
      </CtaLink>
    </main>
  );
}
