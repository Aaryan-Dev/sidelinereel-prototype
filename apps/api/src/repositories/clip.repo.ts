import type { Decision } from '@sidelinereel/shared';
import type { Db } from '../lib/prisma';
import type { ClipRepository } from './types';

export function createClipRepository(db: Db): ClipRepository {
  return {
    async clipExists(sessionId, clipId) {
      const count = await db.clip.count({ where: { id: clipId, sessionId } });
      return count > 0;
    },

    async upsertDecision(clipId, decision: Decision) {
      const data = {
        action: decision.action.toUpperCase() as 'CONFIRM' | 'REASSIGN' | 'EXCLUDE',
        toNumber: decision.action === 'reassign' ? decision.to : null,
        decidedAt: new Date(),
      };
      await db.clipDecision.upsert({
        where: { clipId },
        create: { clipId, ...data },
        update: data,
      });
    },

    async deleteDecision(clipId) {
      await db.clipDecision.deleteMany({ where: { clipId } });
    },

    async createReport(clipId, playerNumber, confidence) {
      await db.parentReport.create({ data: { clipId, playerNumber, confidence } });
    },
  };
}
