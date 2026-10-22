import { randomUUID } from 'node:crypto';
import type { Decision } from '@sidelinereel/shared';
import type {
  ClipRecord,
  ClipRepository,
  SeedGame,
  SessionData,
  SessionRepository,
} from '../src/repositories/types';

interface StoredSession {
  id: string;
  threshold: number;
  sentAt: Date | null;
  lastSeenAt: Date;
  players: SeedGame['players'];
  clips: ClipRecord[];
}

/** In-memory stand-in for both repositories, so API tests need no database. */
export function createFakeRepositories() {
  const sessions = new Map<string, StoredSession>();

  const session: SessionRepository = {
    async create(seed) {
      const id = randomUUID();
      sessions.set(id, {
        id,
        threshold: 0.85,
        sentAt: null,
        lastSeenAt: new Date(),
        players: seed.players.map((p) => ({ ...p })),
        clips: seed.clips.map((c) => ({ ...c, id: randomUUID() })),
      });
      return id;
    },
    async load(id): Promise<SessionData | null> {
      const s = sessions.get(id);
      if (!s) return null;
      s.lastSeenAt = new Date();
      return {
        session: { id: s.id, threshold: s.threshold, sentAt: s.sentAt },
        players: s.players,
        clips: s.clips.map((c) => ({ ...c })),
      };
    },
    async updateThreshold(id, threshold) {
      sessions.get(id)!.threshold = threshold;
    },
    async markSent(id, at) {
      sessions.get(id)!.sentAt = at;
    },
    async reset(id, defaultThreshold) {
      const s = sessions.get(id)!;
      s.threshold = defaultThreshold;
      s.sentAt = null;
      s.clips = s.clips.map(({ decision: _d, report: _r, ...rest }) => rest);
    },
    async deleteStale(before) {
      let removed = 0;
      for (const [id, s] of sessions) {
        if (s.lastSeenAt < before) {
          sessions.delete(id);
          removed += 1;
        }
      }
      return removed;
    },
  };

  const find = (clipId: string) => {
    for (const s of sessions.values()) {
      const clip = s.clips.find((c) => c.id === clipId);
      if (clip) return { s, clip };
    }
    return undefined;
  };

  const clips: ClipRepository = {
    async clipExists(sessionId, clipId) {
      return !!sessions.get(sessionId)?.clips.some((c) => c.id === clipId);
    },
    async upsertDecision(clipId, decision: Decision) {
      const hit = find(clipId);
      if (hit) {
        const i = hit.s.clips.indexOf(hit.clip);
        hit.s.clips[i] = { ...hit.clip, decision };
      }
    },
    async deleteDecision(clipId) {
      const hit = find(clipId);
      if (hit) {
        const i = hit.s.clips.indexOf(hit.clip);
        const { decision: _d, ...rest } = hit.clip;
        hit.s.clips[i] = rest;
      }
    },
    async createReport(clipId, playerNumber, confidence) {
      const hit = find(clipId);
      if (hit) {
        const i = hit.s.clips.indexOf(hit.clip);
        hit.s.clips[i] = { ...hit.clip, report: { playerNumber, confidence, createdAt: new Date() } };
      }
    },
  };

  return { session, clips, sessions };
}
