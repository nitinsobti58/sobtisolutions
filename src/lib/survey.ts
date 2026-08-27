export type Point = { x: number; y: number };

/** FNV-1a 32-bit string hash. Pure, so server and client agree. */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32: a small deterministic PRNG for seeded geometry. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Degrees clockwise from north. SVG y grows downward, so north is -y. */
export function azimuth(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export type BearingPrecision = "seconds" | "minutes";

const pad = (n: number) => n.toString().padStart(2, "0");

function formatAngle(angle: number, precision: BearingPrecision): string {
  if (precision === "minutes") {
    const totalMinutes = Math.round(angle * 60);
    return `${Math.floor(totalMinutes / 60)}°${pad(totalMinutes % 60)}'`;
  }
  const totalSeconds = Math.round(angle * 3600);
  const d = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${d}°${pad(m)}'${pad(s)}"`;
}

/** Quadrant bearing of a course, e.g. N 41°30'12" E, derived from the geometry. */
export function bearing(
  from: Point,
  to: Point,
  precision: BearingPrecision = "seconds",
): string {
  const az = azimuth(from, to);
  if (az <= 90) return `N ${formatAngle(az, precision)} E`;
  if (az <= 180) return `S ${formatAngle(180 - az, precision)} E`;
  if (az <= 270) return `S ${formatAngle(az - 180, precision)} W`;
  return `N ${formatAngle(360 - az, precision)} W`;
}

/** Course length in feet at a nominal drawing scale. */
export function distanceFeet(from: Point, to: Point, feetPerUnit = 0.6): string {
  return (Math.hypot(to.x - from.x, to.y - from.y) * feetPerUnit).toFixed(2);
}

/** Rotation for a label set along a course, normalized into (-90, 90] so it never reads upside down. */
export function labelAngle(from: Point, to: Point): number {
  let a = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  if (a > 90) a -= 180;
  if (a <= -90) a += 180;
  return a;
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function pathFrom(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ") + " Z";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export type Rect = { left: number; top: number; width: number; height: number };

/**
 * A closed n-gon inside a rectangle, each vertex nudged by up to `jitter` of the
 * radius from the seed, so different seeds draw visibly different parcels.
 */
export function seededParcel(
  seed: string,
  rect: Rect,
  options: { sides?: number; jitter?: number } = {},
): Point[] {
  const { sides = 6, jitter = 0.09 } = options;
  const rand = seededRandom(hash32(seed));
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const rx = rect.width / 2;
  const ry = rect.height / 2;
  const start = -Math.PI / 2 + (rand() - 0.5) * 0.4;
  const points: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const theta = start + (i / sides) * Math.PI * 2;
    const radial = 1 + (rand() * 2 - 1) * jitter;
    const angular = (rand() * 2 - 1) * (Math.PI / sides) * 0.5;
    points.push({
      x: round2(cx + Math.cos(theta + angular) * rx * radial),
      y: round2(cy + Math.sin(theta + angular) * ry * radial),
    });
  }
  return points;
}
