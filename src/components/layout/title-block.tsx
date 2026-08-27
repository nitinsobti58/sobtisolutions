import { cn } from "@/lib/utils";

type Item = { label: string; value: React.ReactNode };

type Props = {
  items: Item[];
  /** Ink frame for the page's one heavier line; hairline for supporting blocks. */
  frame?: "ink" | "hairline";
  columns?: 2 | 3 | 4;
  size?: "default" | "sm";
  className?: string;
};

const columnClass = {
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
} as const;

/** A drawing's title block: labelled cells separated by hairline rules inside one frame. */
export function TitleBlock({ items, frame = "hairline", columns = 4, size = "default", className }: Props) {
  const small = size === "sm";
  return (
    <dl
      className={cn(
        "grid gap-px bg-border",
        columnClass[columns],
        frame === "ink" ? "border border-foreground" : "border border-border",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className={cn("bg-background", small ? "px-4 py-3" : "px-5 py-5 md:px-6")}>
          <dt
            className={cn(
              "font-heading font-medium tracking-[0.06em] uppercase text-muted-foreground",
              small ? "text-[11px]" : "text-xs",
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              "mt-1 font-heading leading-tight font-medium tabular-nums text-balance [overflow-wrap:anywhere]",
              small ? "text-sm" : "text-lg md:text-[22px]",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
