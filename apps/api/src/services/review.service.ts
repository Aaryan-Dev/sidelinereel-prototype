import type { Decision, DecisionResult } from '@sidelinereel/shared';
import { conflict, notFound, unprocessable } from '../lib/errors';
import type { ClipRepository, SessionRepository } from '../repositories/types';
import { requireSession } from './session.service';

export interface ReviewService {
  decide(sessionId: string, clipId: string, decision: Decision): Promise<DecisionResult>;
  undo(sessionId: string, clipId: string): Promise<DecisionResult>;
}

export function createReviewService(
  sessions: SessionRepository,
  clips: ClipRepository,
): ReviewService {
  async function load(sessionId: string, clipId: string) {
    const data = await requireSession(sessions, sessionId);
    const clip = data.clips.find((c) => c.id === clipId);
    if (!clip) throw notFound('CLIP_NOT_FOUND', 'Clip not found in this session.');
    return { data, clip };
  }

  return {
    async decide(sessionId, clipId, decision) {
      const { data, clip } = await load(sessionId, clipId);
      if (clip.report) {
        throw conflict('CLIP_REPORTED', 'A parent already reported this clip as the wrong kid.');
      }
      if (decision.action === 'reassign' && !data.players.some((p) => p.number === decision.to)) {
        throw unprocessable('INVALID_PLAYER', `#${decision.to} is not on the roster.`);
      }
      if (decision.action === 'confirm' && !data.players.some((p) => p.number === clip.detected)) {
        throw unprocessable('INVALID_PLAYER', `#${clip.detected} is not on the roster. Reassign it instead.`);
      }
      await clips.upsertDecision(clipId, decision);
      return { updatedAfterSend: data.session.sentAt !== null };
    },

    async undo(sessionId, clipId) {
      const { data } = await load(sessionId, clipId);
      await clips.deleteDecision(clipId);
      return { updatedAfterSend: data.session.sentAt !== null };
    },
  };
}
