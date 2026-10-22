import type { Decision } from '@sidelinereel/shared';
import type { DecisionAction, Prisma } from '@prisma/client';
import type { Db } from '../lib/prisma';
import type { ClipRecord, SessionData, SessionRepository } from './types';

type ClipWithRelations = Prisma.ClipGetPayload<{ include: { decision: true; report: true } }>;

function toDecision(row: NonNullable<ClipWithRelations['decision']>): Decision {
  const action: Record<DecisionAction, Decision['action']> = {
    CONFIRM: 'confirm',
    REASSIGN: 'reassign',
    EXCLUDE: 'exclude',
  };
  const kind = action[row.action];
  if (kind === 'reassign') return { action: 'reassign', to: row.toNumber ?? 0 };
  return { action: kind } as Decision;
}

function toClipRecord(row: ClipWithRelations): ClipRecord {
  return {
    id: row.id,
    minute: row.minute,
    moment: row.moment,
    detected: row.detectedNumber,
    confidence: row.confidence,
    frameNumber: row.frameNumber,
    ...(row.decision ? { decision: toDecision(row.decision) } : {}),
    ...(row.report
      ? {
          report: {
            playerNumber: row.report.playerNumber,
            confidence: row.report.confidence,
            createdAt: row.report.createdAt,
          },
        }
      : {}),
  };
}

export function createSessionRepository(db: Db): SessionRepository {
  return {
    async create(seed) {
      const session = await db.demoSession.create({
        data: {
          players: { create: seed.players.map((p) => ({ number: p.number, name: p.name })) },
          clips: {
            create: seed.clips.map((c, position) => ({
              position,
              minute: c.minute,
              moment: c.moment,
              detectedNumber: c.detected,
              confidence: c.confidence,
              frameNumber: c.frameNumber,
            })),
          },
        },
        select: { id: true },
      });
      return session.id;
    },

    async load(id): Promise<SessionData | null> {
      const session = await db.demoSession
        .update({
          where: { id },
          data: { lastSeenAt: new Date() },
          include: {
            players: { orderBy: { number: 'asc' } },
            clips: { orderBy: { position: 'asc' }, include: { decision: true, report: true } },
          },
        })
        .catch((e: unknown) => {
          // P2025: record to update not found
          if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2025') {
            return null;
          }
          throw e;
        });
      if (!session) return null;
      return {
        session: { id: session.id, threshold: session.threshold, sentAt: session.sentAt },
        players: session.players.map((p) => ({ number: p.number, name: p.name })),
        clips: session.clips.map(toClipRecord),
      };
    },

    async updateThreshold(id, threshold) {
      await db.demoSession.update({ where: { id }, data: { threshold } });
    },

    async markSent(id, at) {
      await db.demoSession.update({ where: { id }, data: { sentAt: at } });
    },

    async reset(id, defaultThreshold) {
      await db.$transaction([
        db.clipDecision.deleteMany({ where: { clip: { sessionId: id } } }),
        db.parentReport.deleteMany({ where: { clip: { sessionId: id } } }),
        db.demoSession.update({ where: { id }, data: { sentAt: null, threshold: defaultThreshold } }),
      ]);
    },

    async deleteStale(before) {
      const { count } = await db.demoSession.deleteMany({ where: { lastSeenAt: { lt: before } } });
      return count;
    },
  };
}
