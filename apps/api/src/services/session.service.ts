import { DEFAULT_THRESHOLD, type SendResult, type SessionState } from '@sidelinereel/shared';
import { notFound } from '../lib/errors';
import { demoGame } from '../seed/demoGame';
import type { SessionData, SessionRepository } from '../repositories/types';
import { buildSessionState } from './session.state';

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export interface SessionService {
  create(): Promise<{ sessionId: string }>;
  getState(id: string): Promise<SessionState>;
  setThreshold(id: string, threshold: number): Promise<SessionState>;
  reset(id: string): Promise<SessionState>;
  send(id: string): Promise<SendResult>;
}

/** Load a session or fail with 404. Shared by the services that act on an existing session. */
export async function requireSession(repo: SessionRepository, id: string): Promise<SessionData> {
  const data = await repo.load(id);
  if (!data) throw notFound('SESSION_NOT_FOUND', 'Demo session not found. Start a new one.');
  return data;
}

export function createSessionService(repo: SessionRepository, now = () => new Date()): SessionService {
  return {
    async create() {
      // Keep the free-tier database small: drop sessions nobody has touched for a day.
      await repo.deleteStale(new Date(now().getTime() - STALE_AFTER_MS));
      return { sessionId: await repo.create(demoGame) };
    },

    async getState(id) {
      return buildSessionState(await requireSession(repo, id));
    },

    async setThreshold(id, threshold) {
      await requireSession(repo, id);
      await repo.updateThreshold(id, threshold);
      return buildSessionState(await requireSession(repo, id));
    },

    async reset(id) {
      await requireSession(repo, id);
      await repo.reset(id, DEFAULT_THRESHOLD);
      return buildSessionState(await requireSession(repo, id));
    },

    async send(id) {
      const before = buildSessionState(await requireSession(repo, id));
      const sentAt = now();
      await repo.markSent(id, sentAt);
      // The weekly recap goes to every family on the roster; unresolved clips are simply left out.
      return {
        sentAt: sentAt.toISOString(),
        families: before.roster.length,
        heldClips: before.health.queueSize,
      };
    },
  };
}
