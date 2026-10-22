// End-to-end through HTTP, with in-memory repositories. AC numbers refer to the Task 2 spec.
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ResolvedClip, SendResult, SessionState } from '@sidelinereel/shared';
import { createApp } from '../src/app';
import { createLogger } from '../src/lib/logger';
import { createReportService } from '../src/services/report.service';
import { createReviewService } from '../src/services/review.service';
import { createSessionService } from '../src/services/session.service';
import { createFakeRepositories } from './fakes';

function setup() {
  const repos = createFakeRepositories();
  const app = createApp({
    sessionService: createSessionService(repos.session),
    reviewService: createReviewService(repos.session, repos.clips),
    reportService: createReportService(repos.session, repos.clips),
    logger: createLogger('silent', false),
    corsOrigins: [],
    trustProxy: 0,
    rateLimiting: false,
  });
  return { app, repos };
}

let app: ReturnType<typeof setup>['app'];
let id: string;

const state = async () => (await request(app).get(`/api/v1/sessions/${id}/state`)).body as SessionState;
const clipAt = (s: SessionState, minute: number): ResolvedClip =>
  s.clips.find((c) => c.minute === minute)!;
const decide = (clipId: string, body: object) =>
  request(app).put(`/api/v1/sessions/${id}/clips/${clipId}/decision`).send(body);

beforeEach(async () => {
  ({ app } = setup());
  id = (await request(app).post('/api/v1/sessions')).body.sessionId;
});

describe('sessions', () => {
  it('reports health', async () => {
    expect((await request(app).get('/health')).body).toEqual({ status: 'ok' });
  });

  it('seeds a game with 12 clips, half of them held for review', async () => {
    const s = await state();
    expect(s.clips).toHaveLength(12);
    expect(s.health.queueSize).toBe(6);
    expect(s.health.autoAccepted).toBe(6);
  });

  it('AC1/AC8: held clips are in no reel and never a thumbnail', async () => {
    const s = await state();
    const held = s.clips.filter((c) => c.status === 'review').map((c) => c.id);
    for (const reel of s.reels) {
      expect(reel.clips.every((c) => !held.includes(c.id))).toBe(true);
      if (reel.thumbnail) expect(held).not.toContain(reel.thumbnail.id);
    }
  });

  it('404s for an unknown session', async () => {
    const res = await request(app).get('/api/v1/sessions/6f1d5c1e-0000-4000-8000-000000000000/state');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('SESSION_NOT_FOUND');
  });

  it('400s for a malformed session id', async () => {
    expect((await request(app).get('/api/v1/sessions/nope/state')).status).toBe(400);
  });

  it('isolates sessions from each other', async () => {
    const other = (await request(app).post('/api/v1/sessions')).body.sessionId;
    const before = await state();
    await decide(clipAt(before, 4).id, { action: 'exclude' });
    const otherState = (await request(app).get(`/api/v1/sessions/${other}/state`)).body as SessionState;
    expect(otherState.health.queueSize).toBe(6);
  });
});

describe('coach decisions', () => {
  it('AC5: reassigning #14-read-as-... puts the clip in that player only', async () => {
    const s = await state();
    const clip = clipAt(s, 4); // shirt #4, read as #14
    expect((await decide(clip.id, { action: 'reassign', to: 4 })).status).toBe(200);
    const after = await state();
    expect(after.reels.find((r) => r.player.number === 4)!.clips.map((c) => c.id)).toContain(clip.id);
    expect(after.reels.find((r) => r.player.number === 14)!.clips.map((c) => c.id)).not.toContain(clip.id);
    expect(after.health.queueSize).toBe(5);
  });

  it('AC6: excluding removes the clip from every reel', async () => {
    const clip = clipAt(await state(), 12);
    await decide(clip.id, { action: 'exclude' });
    const after = await state();
    expect(after.reels.flatMap((r) => r.clips).map((c) => c.id)).not.toContain(clip.id);
  });

  it('AC7: confirming puts the clip in the detected player reel', async () => {
    const clip = clipAt(await state(), 27); // shirt #4, correctly read as #4
    await decide(clip.id, { action: 'confirm' });
    const after = await state();
    expect(after.reels.find((r) => r.player.number === 4)!.clips.map((c) => c.id)).toContain(clip.id);
  });

  it('undo returns the clip to the queue', async () => {
    const clip = clipAt(await state(), 27);
    await decide(clip.id, { action: 'confirm' });
    await request(app).delete(`/api/v1/sessions/${id}/clips/${clip.id}/decision`);
    expect(clipAt(await state(), 27).status).toBe('review');
  });

  it('422s when reassigning to a number not on the roster', async () => {
    const res = await decide(clipAt(await state(), 4).id, { action: 'reassign', to: 99 });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_PLAYER');
  });

  it('422s when confirming a number that is not on the roster', async () => {
    const clip = clipAt(await state(), 35); // read as #32, shirt is #23
    const res = await decide(clip.id, { action: 'confirm' });
    expect(res.status).toBe(422);
    expect((await decide(clip.id, { action: 'reassign', to: 23 })).status).toBe(200);
  });

  it('400s on an invalid decision body', async () => {
    expect((await decide(clipAt(await state(), 4).id, { action: 'delete' })).status).toBe(400);
  });

  it('404s for a clip from another session', async () => {
    const res = await decide('6f1d5c1e-0000-4000-8000-000000000000', { action: 'confirm' });
    expect(res.status).toBe(404);
  });
});

describe('threshold', () => {
  it('a higher threshold flags more clips', async () => {
    const res = await request(app).patch(`/api/v1/sessions/${id}`).send({ threshold: 0.95 });
    expect(res.status).toBe(200);
    expect((res.body as SessionState).health.queueSize).toBeGreaterThan(6);
  });

  it('rejects an out-of-range threshold', async () => {
    expect((await request(app).patch(`/api/v1/sessions/${id}`).send({ threshold: 0.1 })).status).toBe(400);
  });
});

describe('weekly send', () => {
  it('AC9: sends on schedule with unresolved clips left out', async () => {
    const res = await request(app).post(`/api/v1/sessions/${id}/send`);
    expect(res.status).toBe(200);
    const result = res.body as SendResult;
    expect(result.heldClips).toBe(6);
    expect(result.families).toBe(10);
    expect((await state()).sentAt).not.toBeNull();
  });

  it('AC11: a decision after the send is flagged as an update to families', async () => {
    await request(app).post(`/api/v1/sessions/${id}/send`);
    const res = await decide(clipAt(await state(), 4).id, { action: 'reassign', to: 4 });
    expect(res.body.updatedAfterSend).toBe(true);
  });

  it('a decision before the send is not an update', async () => {
    const res = await decide(clipAt(await state(), 4).id, { action: 'exclude' });
    expect(res.body.updatedAfterSend).toBe(false);
  });
});

describe('parent reports', () => {
  it('AC10: reporting removes the clip from the reel and logs it', async () => {
    const clip = clipAt(await state(), 49); // #7 wrongly auto-accepted into #9's reel
    expect(clip.status).toBe('auto');
    const res = await request(app).post(`/api/v1/sessions/${id}/clips/${clip.id}/reports`);
    expect(res.status).toBe(201);
    const after = await state();
    expect(after.reels.find((r) => r.player.number === 9)!.clips.map((c) => c.id)).not.toContain(clip.id);
    expect(after.reports).toHaveLength(1);
    expect(after.reports[0]).toMatchObject({ playerNumber: 9, confidence: 0.92 });
    expect(after.health.reportsOnAutoAccepted).toBe(1);
  });

  it('409s when reporting twice', async () => {
    const clip = clipAt(await state(), 49);
    await request(app).post(`/api/v1/sessions/${id}/clips/${clip.id}/reports`);
    const again = await request(app).post(`/api/v1/sessions/${id}/clips/${clip.id}/reports`);
    expect(again.status).toBe(409);
  });

  it('409s when reporting a clip that is not in any reel', async () => {
    const clip = clipAt(await state(), 4); // held for review
    const res = await request(app).post(`/api/v1/sessions/${id}/clips/${clip.id}/reports`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CLIP_NOT_IN_REEL');
  });

  it('409s when the coach decides on a reported clip', async () => {
    const clip = clipAt(await state(), 49);
    await request(app).post(`/api/v1/sessions/${id}/clips/${clip.id}/reports`);
    expect((await decide(clip.id, { action: 'confirm' })).status).toBe(409);
  });
});

describe('reset', () => {
  it('restores the seeded game', async () => {
    const s = await state();
    await decide(clipAt(s, 4).id, { action: 'exclude' });
    await request(app).patch(`/api/v1/sessions/${id}`).send({ threshold: 0.95 });
    await request(app).post(`/api/v1/sessions/${id}/send`);
    const res = await request(app).post(`/api/v1/sessions/${id}/reset`);
    const after = res.body as SessionState;
    expect(after.health.queueSize).toBe(6);
    expect(after.threshold).toBe(0.85);
    expect(after.sentAt).toBeNull();
  });
});
