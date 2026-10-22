// Matching rules from the Task 2 spec. Pure functions, no I/O.
import type { Classification, Clip, Decision, Player, Reel, ResolvedClip } from './types';

export const DEFAULT_THRESHOLD = 0.85;

// Clip statuses that are allowed into a reel and its thumbnail.
const PUBLISHED = new Set(['auto', 'confirmed', 'reassigned']);

/**
 * Two jersey numbers are confusable when one is the other with a digit added
 * (1/11, 4/14, 4/41) or when they are the same digits swapped (14/41).
 */
export function isConfusable(a: number, b: number): boolean {
  const x = String(a);
  const y = String(b);
  if (x === y) return false;
  if (x.length === y.length && x.length > 1 && x === [...y].reverse().join('')) return true;
  const [short, long] = x.length < y.length ? [x, y] : [y, x];
  return long.length === short.length + 1 && (long.startsWith(short) || long.endsWith(short));
}

export function confusableWith(number: number, roster: Player[]): number[] {
  return roster.map((p) => p.number).filter((n) => isConfusable(number, n));
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Decide whether a detected clip can be auto-accepted or must go to the coach. */
export function classifyClip(
  clip: Pick<Clip, 'detected' | 'confidence'>,
  roster: Player[],
  threshold: number = DEFAULT_THRESHOLD,
): Classification {
  if (!roster.some((p) => p.number === clip.detected)) {
    return { route: 'review', reason: `#${clip.detected} is not on the roster` };
  }
  if (clip.confidence < threshold) {
    return {
      route: 'review',
      reason: `Below the ${pct(threshold)} bar (${pct(clip.confidence)} sure)`,
    };
  }
  const similar = confusableWith(clip.detected, roster);
  if (similar.length) {
    return {
      route: 'review',
      reason: `Similar numbers on the roster: ${similar.map((n) => `#${n}`).join(', ')}`,
    };
  }
  return { route: 'auto', reason: 'High confidence, no similar numbers on the roster' };
}

/**
 * Combine the system's classification with the coach's decision and any parent report.
 * A parent report wins, then a coach decision, then the automatic classification.
 */
export function resolveClip(
  clip: Clip,
  roster: Player[],
  threshold: number,
  decision?: Decision,
  reported = false,
): ResolvedClip {
  const { route, reason } = classifyClip(clip, roster, threshold);
  if (reported) return { ...clip, reason, status: 'reported', playerNumber: null };
  if (decision?.action === 'confirm') {
    return { ...clip, reason, status: 'confirmed', playerNumber: clip.detected };
  }
  if (decision?.action === 'reassign') {
    return { ...clip, reason, status: 'reassigned', playerNumber: decision.to };
  }
  if (decision?.action === 'exclude') {
    return { ...clip, reason, status: 'excluded', playerNumber: null };
  }
  if (route === 'auto') return { ...clip, reason, status: 'auto', playerNumber: clip.detected };
  // Hold, don't guess: an unresolved clip belongs to nobody yet.
  return { ...clip, reason, status: 'review', playerNumber: null, heldFor: clip.detected };
}

/**
 * A player's reel: only published clips, a thumbnail chosen from those only,
 * and the clips held back for coach review.
 */
export function buildReel(number: number, resolved: ResolvedClip[]): Reel {
  const clips = resolved
    .filter((c) => PUBLISHED.has(c.status) && c.playerNumber === number)
    .sort((a, b) => a.minute - b.minute);
  const held = resolved.filter((c) => c.status === 'review' && c.heldFor === number);
  const thumbnail = clips.find((c) => c.moment === 'Goal') ?? clips[0] ?? null;
  return { clips, held, thumbnail };
}
