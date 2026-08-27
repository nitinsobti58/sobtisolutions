import type { Metadata } from "next";

import { TitleBlock } from "@/components/layout/title-block";
import { principals } from "@/data/principals";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sobti Solutions LLC is a family-owned real estate holding company in Ocean County, New Jersey: who we are, how we work, and who runs it.",
};

// TODO: placeholder copy pending owner review.
const principles = [
  {
    title: "Hold, don't flip",
    body: "We buy buildings we intend to keep. That changes how we look at a property and how we treat the people in it.",
  },
  {
    title: "Keep it in good repair",
    body: "Maintenance is done on a schedule, not when something breaks. Small problems stay small.",
  },
  {
    title: "Manage what we own",
    body: "There is no management company between us and our tenants. Calls and messages reach one of the three of us.",
  },
  {
    title: "Deal plainly",
    body: "Clear terms, written down, followed. With sellers, agents, lenders, and tenants alike.",
  },
];

export default function AboutPage() {
  return (
    <main className="wrap flex flex-1 flex-col gap-16 py-16 md:gap-24 md:py-24">
      <section className="flex flex-col gap-6">
        <h1 className="font-heading text-4xl leading-[1.08] font-medium tracking-[-0.015em] md:text-5xl">
          About
        </h1>
        {/* TODO: placeholder company story pending owner review. */}
        <div className="flex max-w-[60ch] flex-col gap-4 text-[19px] leading-normal text-pretty">
          <p>
            Sobti Solutions is a real estate holding company owned and run by
            three members of one family. We buy small residential buildings in
            Toms River and the towns around Barnegat Bay, keep them in good
            repair, and hold them for the long term.
          </p>
          <p>
            We are not a brokerage and we do not list properties for others.
            What appears on this site is what we own.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-8" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-heading text-2xl font-medium tracking-[-0.01em] md:text-[28px]">
          How we work
        </h2>
        <ol className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {principles.map((item, index) => (
            <li key={item.title} className="flex flex-col gap-2 bg-background p-5 md:p-6">
              <p className="font-heading text-xs font-medium tracking-[0.06em] uppercase tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-heading text-lg font-medium">{item.title}</h3>
              <p className="text-[15px] text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-8" aria-labelledby="who-heading">
        <h2 id="who-heading" className="font-heading text-2xl font-medium tracking-[-0.01em] md:text-[28px]">
          Who runs it
        </h2>
        {principals.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-3">
            {principals.map((person) => (
              <li key={person.name} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-5">
                <h3 className="font-heading text-lg font-medium">{person.name}</h3>
                <p className="text-[15px] text-muted-foreground">{person.role}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-[60ch] text-[17px] text-pretty">
            Three principals from one family, all based in Ocean County. Write
            to us and one of the three of us will reply.
          </p>
        )}
        <TitleBlock
          columns={3}
          items={[
            { label: "Entity", value: site.legalName },
            { label: "Formed", value: site.stateOfFormation },
            { label: "Area served", value: site.areaServed },
          ]}
        />
      </section>
    </main>
  );
}
