import { resolveClip } from '@sidelinereel/shared';
import { conflict, notFound } from '../lib/errors';
import type { ClipRepository, SessionRepository } from '../repositories/types';
import { requireSession } from './session.service';

export interface ReportService {
  /** A parent says this clip in their kid's reel is not their kid. */
  report(sessionId: string, clipId: string): Promise<void>;
}

export function createReportService(
  sessions: SessionRepository,
  clips: ClipRepository,
): ReportService {
  return {
    async report(sessionId, clipId) {
      const { session, players, clips: all } = await requireSession(sessions, sessionId);
      const clip = all.find((c) => c.id === clipId);
      if (!clip) throw notFound('CLIP_NOT_FOUND', 'Clip not found in this session.');
      if (clip.report) throw conflict('CLIP_ALREADY_REPORTED', 'This clip was already reported.');

      const resolved = resolveClip(clip, players, session.threshold, clip.decision);
      if (resolved.playerNumber === null) {
        throw conflict('CLIP_NOT_IN_REEL', 'Only a clip that is in a reel can be reported.');
      }
      await clips.createReport(clipId, resolved.playerNumber, clip.confidence);
    },
  };
}
