import {
  buildReel,
  classifyClip,
  resolveClip,
  type Health,
  type PlayerReel,
  type ReportEntry,
  type SessionState,
} from '@sidelinereel/shared';
import type { SessionData } from '../repositories/types';

/** Compute the full view of a session. All matching rules come from the shared package. */
export function buildSessionState({ session, players, clips }: SessionData): SessionState {
  const { threshold } = session;
  const resolved = clips.map((c) => resolveClip(c, players, threshold, c.decision, !!c.report));

  const reels: PlayerReel[] = players.map((player) => ({
    player,
    ...buildReel(player.number, resolved),
  }));

  const nameOf = (n: number) => players.find((p) => p.number === n)?.name ?? `#${n}`;
  const reports: ReportEntry[] = clips
    .filter((c) => c.report)
    .map((c) => ({
      clipId: c.id,
      playerNumber: c.report!.playerNumber,
      playerName: nameOf(c.report!.playerNumber),
      confidence: c.report!.confidence,
      moment: c.moment,
      minute: c.minute,
      createdAt: c.report!.createdAt.toISOString(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const autoAccepted = clips.filter((c) => classifyClip(c, players, threshold).route === 'auto');
  const health: Health = {
    totalClips: clips.length,
    autoAccepted: autoAccepted.length,
    queueSize: resolved.filter((c) => c.status === 'review').length,
    flaggedShare: clips.length ? 1 - autoAccepted.length / clips.length : 0,
    emptyReels: reels.filter((r) => r.clips.length === 0).length,
    reportsOnAutoAccepted: autoAccepted.filter((c) => c.report && !c.decision).length,
  };

  return {
    sessionId: session.id,
    threshold,
    sentAt: session.sentAt ? session.sentAt.toISOString() : null,
    roster: players,
    clips: resolved,
    reels,
    reports,
    health,
  };
}
