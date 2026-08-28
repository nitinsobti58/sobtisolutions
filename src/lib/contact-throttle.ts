/**
 * In-process send throttle. Vercel keeps a function instance warm across requests, so this bounds what
 * one client, and one instance, can push through the mailbox before Zoho's own outbound limits bite.
 * It is per instance, not global; a platform rate-limit rule is the real ceiling. Only successful sends count.
 */
export const throttleLimits = {
  perClient: { max: 5, windowMs: 10 * 60_000 },
  perInstance: { max: 30, windowMs: 60 * 60_000 },
} as const;

const instanceKey = "*";
const buckets = new Map<string, number[]>();

function recent(key: string, windowMs: number, now: number): number[] {
  const kept = (buckets.get(key) ?? []).filter((at) => now - at < windowMs);
  if (kept.length) buckets.set(key, kept);
  else buckets.delete(key);
  return kept;
}

/** Whether this client may send right now. */
export function sendAllowed(client: string, now = Date.now()): boolean {
  return (
    recent(instanceKey, throttleLimits.perInstance.windowMs, now).length < throttleLimits.perInstance.max &&
    recent(`client:${client}`, throttleLimits.perClient.windowMs, now).length < throttleLimits.perClient.max
  );
}

/** Count one send against the client and the instance. */
export function recordSend(client: string, now = Date.now()): void {
  for (const key of [instanceKey, `client:${client}`]) {
    buckets.set(key, [...(buckets.get(key) ?? []), now]);
  }
  if (buckets.size > 500) {
    for (const key of buckets.keys()) recent(key, throttleLimits.perClient.windowMs, now);
  }
}

/** Test seam. */
export function resetThrottle(): void {
  buckets.clear();
}
