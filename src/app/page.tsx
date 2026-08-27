import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-medium tracking-tight">{site.name}</h1>
      <p className="text-muted-foreground">{site.description}</p>
    </main>
  );
}
