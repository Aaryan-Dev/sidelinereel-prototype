// AC numbers refer to the acceptance criteria in Task 2 of the spec.
import { describe, expect, it } from 'vitest';
import { buildReel, classifyClip, isConfusable, resolveClip } from './matching';
import type { Clip, Player } from './types';

const roster: Player[] = [1, 4, 5, 7, 11, 14, 41].map((number) => ({
  number,
  name: `Player ${number}`,
}));
const clip = (over: Partial<Clip> = {}): Clip => ({
  id: 'x',
  minute: 10,
  moment: 'Goal',
  detected: 7,
  confidence: 0.95,
  frameNumber: 7,
  ...over,
});

describe('isConfusable', () => {
  it('flags an added digit and swapped digits', () => {
    expect(isConfusable(1, 11)).toBe(true);
    expect(isConfusable(4, 14)).toBe(true);
    expect(isConfusable(14, 41)).toBe(true);
  });
  it('does not flag unrelated or identical numbers', () => {
    expect(isConfusable(7, 9)).toBe(false);
    expect(isConfusable(11, 11)).toBe(false);
  });
});

describe('classifyClip', () => {
  it('AC1: low confidence goes to review', () => {
    expect(classifyClip(clip({ confidence: 0.6 }), roster).route).toBe('review');
  });
  it('AC2: #4 with #14 on the roster is flagged even at high confidence', () => {
    expect(classifyClip(clip({ detected: 4, confidence: 0.99 }), roster).route).toBe('review');
  });
  it('AC3: #11 with #1 on the roster is flagged', () => {
    expect(classifyClip(clip({ detected: 11, confidence: 0.99 }), roster).route).toBe('review');
  });
  it('AC4: #41 with #14 on the roster is flagged and names #14', () => {
    expect(classifyClip(clip({ detected: 41, confidence: 0.99 }), roster).reason).toMatch(/#14/);
  });
  it('AC12: high confidence with no confusable number is auto-accepted', () => {
    expect(classifyClip(clip({ detected: 7 }), roster).route).toBe('auto');
  });
  it('a number not on the roster goes to review', () => {
    expect(classifyClip(clip({ detected: 32 }), roster).route).toBe('review');
  });
});

describe('resolveClip and buildReel', () => {
  it('AC1/AC8: an unresolved clip is in no reel and never the thumbnail', () => {
    const reel = buildReel(4, [resolveClip(clip({ detected: 4 }), roster, 0.85)]);
    expect(reel.clips).toHaveLength(0);
    expect(reel.thumbnail).toBeNull();
    expect(reel.held).toHaveLength(1);
  });
  it('AC5: reassign moves the clip into that player only', () => {
    const r = [resolveClip(clip({ detected: 4 }), roster, 0.85, { action: 'reassign', to: 14 })];
    expect(buildReel(14, r).clips).toHaveLength(1);
    expect(buildReel(4, r).clips).toHaveLength(0);
  });
  it('AC6: an excluded clip is in no reel', () => {
    const r = [resolveClip(clip({ detected: 4 }), roster, 0.85, { action: 'exclude' })];
    expect(roster.every((p) => buildReel(p.number, r).clips.length === 0)).toBe(true);
  });
  it('AC7: confirm puts the clip in the matched player reel', () => {
    const r = [resolveClip(clip({ detected: 4 }), roster, 0.85, { action: 'confirm' })];
    expect(buildReel(4, r).clips).toHaveLength(1);
  });
  it('AC10: a parent report removes the clip from the reel', () => {
    const r = [resolveClip(clip({ detected: 7 }), roster, 0.85, undefined, true)];
    expect(buildReel(7, r).clips).toHaveLength(0);
  });
  it('prefers a goal for the thumbnail and ignores held clips', () => {
    const r = [
      resolveClip(clip({ id: 'a', moment: 'Save', minute: 3 }), roster, 0.85),
      resolveClip(clip({ id: 'b', moment: 'Goal', minute: 40 }), roster, 0.85),
      resolveClip(clip({ id: 'c', moment: 'Goal', minute: 1, detected: 4 }), roster, 0.85),
    ];
    expect(buildReel(7, r).thumbnail?.id).toBe('b');
  });
});
