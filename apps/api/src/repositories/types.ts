import type { Clip, Decision, Player } from '@sidelinereel/shared';

export interface SessionRecord {
  id: string;
  threshold: number;
  sentAt: Date | null;
}

export interface ClipRecord extends Clip {
  decision?: Decision;
  report?: { playerNumber: number; confidence: number; createdAt: Date };
}

export interface SessionData {
  session: SessionRecord;
  players: Player[];
  clips: ClipRecord[];
}

export interface SeedGame {
  players: Player[];
  clips: Omit<Clip, 'id'>[];
}

/** Persistence for demo sessions. Implemented with Prisma; faked in tests. */
export interface SessionRepository {
  /** Create a session with its roster and clips; returns the new session id. */
  create(seed: SeedGame): Promise<string>;
  /** Load everything about a session, or null if it does not exist. Marks the session as seen. */
  load(id: string): Promise<SessionData | null>;
  updateThreshold(id: string, threshold: number): Promise<void>;
  markSent(id: string, at: Date): Promise<void>;
  /** Remove decisions and reports, clear sentAt and restore the default threshold. */
  reset(id: string, defaultThreshold: number): Promise<void>;
  /** Delete sessions not seen since the cutoff; returns how many were removed. */
  deleteStale(before: Date): Promise<number>;
}

/** Persistence for coach decisions and parent reports on a clip. */
export interface ClipRepository {
  clipExists(sessionId: string, clipId: string): Promise<boolean>;
  upsertDecision(clipId: string, decision: Decision): Promise<void>;
  deleteDecision(clipId: string): Promise<void>;
  createReport(clipId: string, playerNumber: number, confidence: number): Promise<void>;
}
