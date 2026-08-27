import {
  bearing,
  distanceFeet,
  labelAngle,
  midpoint,
  pathFrom,
  seededParcel,
  type Point,
} from "@/lib/survey";

/** Fixed hero parcel: six courses, slightly irregular so it reads as a lot, not a rectangle. */
const HERO_PARCEL: Point[] = [
  { x: 118, y: 104 },
  { x: 396, y: 78 },
  { x: 512, y: 174 },
  { x: 488, y: 356 },
  { x: 222, y: 388 },
  { x: 100, y: 268 },
];

const HERO_TIE: Point = { x: 46, y: 42 };

const labelClass = "fill-muted-foreground font-heading font-medium tabular-nums";

type Props = { variant: "hero" } | { variant: "card"; seed: string };

/**
 * A closed parcel traverse drawn the way a filed plat draws it: hairline courses,
 * set and found monuments, bearings derived from the geometry, and a north arrow.
 */
export function Traverse(props: Props) {
  return props.variant === "hero" ? <HeroTraverse /> : <CardTraverse seed={props.seed} />;
}

function HeroTraverse() {
  const pts = HERO_PARCEL;
  return (
    <svg
      viewBox="0 0 600 440"
      className="h-auto w-full max-h-[280px] text-linework md:max-h-none"
      role="img"
      aria-labelledby="traverse-title"
    >
      <title id="traverse-title">Survey plat of a parcel</title>
      <path
        d={pathFrom(pts)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="miter"
        shapeRendering="geometricPrecision"
      />
      <line
        x1={pts[0].x}
        y1={pts[0].y}
        x2={HERO_TIE.x}
        y2={HERO_TIE.y}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <circle cx={HERO_TIE.x} cy={HERO_TIE.y} r={3.5} fill="currentColor" />
      <text
        x={HERO_TIE.x + 12}
        y={HERO_TIE.y + 5}
        fontSize={15.5}
        letterSpacing="0.06em"
        className={labelClass}
      >
        FOUND IRON PIN
      </text>

      {pts.map((from, i) => {
        const to = pts[(i + 1) % pts.length];
        const mid = midpoint(from, to);
        return (
          <g key={i} transform={`translate(${mid.x} ${mid.y}) rotate(${labelAngle(from, to)})`}>
            <text y={-5} textAnchor="middle" fontSize={15.5} className={labelClass}>
              {bearing(from, to)}
            </text>
            <text y={13} textAnchor="middle" fontSize={15.5} className={labelClass}>
              {distanceFeet(from, to)}&apos;
            </text>
          </g>
        );
      })}

      {pts.map((p, i) =>
        i % 2 === 0 ? (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="currentColor" />
        ) : (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            className="fill-background"
            stroke="currentColor"
            strokeWidth={1.25}
          />
        ),
      )}

      <g className="stroke-primary" fill="none" strokeWidth={1.25}>
        <line x1={548} y1={78} x2={548} y2={42} />
        <path d="M541 52 L548 40 L555 52" strokeLinejoin="miter" />
      </g>
      <text
        x={548}
        y={30}
        textAnchor="middle"
        fontSize={15.5}
        className="fill-primary font-heading font-medium"
      >
        N
      </text>

      <text x={596} y={412} textAnchor="end" fontSize={15.5} letterSpacing="0.06em" className={labelClass}>
        SHEET 1 OF 1
      </text>
      <text x={596} y={430} textAnchor="end" fontSize={15.5} letterSpacing="0.06em" className={labelClass}>
        NOT TO SCALE
      </text>
    </svg>
  );
}

function CardTraverse({ seed }: { seed: string }) {
  const pts = seededParcel(seed, { left: 40, top: 30, width: 280, height: 186 });
  return (
    <svg viewBox="0 0 360 270" className="h-full w-full" aria-hidden="true" focusable="false">
      <path
        d={pathFrom(pts)}
        fill="none"
        className="stroke-linework-muted"
        strokeWidth={1}
        strokeLinejoin="miter"
        shapeRendering="geometricPrecision"
      />
      {pts.map((from, i) => {
        const to = pts[(i + 1) % pts.length];
        const mid = midpoint(from, to);
        return (
          <text
            key={i}
            transform={`translate(${mid.x} ${mid.y}) rotate(${labelAngle(from, to)})`}
            y={-4}
            textAnchor="middle"
            fontSize={11}
            className={labelClass}
          >
            {bearing(from, to, "minutes")}
          </text>
        );
      })}
      {pts.map((p, i) =>
        i % 2 === 0 ? (
          <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-linework-muted" />
        ) : (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            className="fill-card stroke-linework-muted"
            strokeWidth={1}
          />
        ),
      )}
      <g className="stroke-linework-muted" fill="none" strokeWidth={1}>
        <line x1={332} y1={52} x2={332} y2={26} />
        <path d="M327 33 L332 24 L337 33" strokeLinejoin="miter" />
      </g>
      <text x={332} y={18} textAnchor="middle" fontSize={11} className={labelClass}>
        N
      </text>
      <text x={332} y={66} textAnchor="middle" fontSize={10} letterSpacing="0.06em" className={labelClass}>
        N.T.S.
      </text>
    </svg>
  );
}
