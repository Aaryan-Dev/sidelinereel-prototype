// Domain types shared by the API and the web app.

export interface Player {
  number: number;
  name: string;
}

/** A highlight clip as detected from footage. */
export interface Clip {
  id: string;
  minute: number;
  moment: string;
  /** Jersey number the system read from the footage. */
  detected: number;
  /** Confidence of that reading, 0 to 1. */
  confidence: number;
  /** Number actually on the jersey in the frame. Only used to draw the illustration. */
  frameNumber: number;
}

export type Decision =
  | { action: 'confirm' }
  | { action: 'reassign'; to: number }
  | { action: 'exclude' };

export type DecisionAction = Decision['action'];

/**
 * auto:       accepted by the system, no review needed
 * review:     held for the coach (in no reel until resolved)
 * confirmed:  coach confirmed the detected number
 * reassigned: coach moved the clip to another player
 * excluded:   coach removed the clip from every reel
 * reported:   a parent reported it as the wrong kid
 */
export type ClipStatus = 'auto' | 'review' | 'confirmed' | 'reassigned' | 'excluded' | 'reported';

export type Route = 'auto' | 'review';

export interface Classification {
  route: Route;
  reason: string;
}

export interface ResolvedClip extends Clip {
  status: ClipStatus;
  reason: string;
  /** Player whose reel the clip is in, or null if it is in no reel. */
  playerNumber: number | null;
  /** For a held clip: the number it was detected as. */
  heldFor?: number;
}

export interface Reel {
  clips: ResolvedClip[];
  held: ResolvedClip[];
  thumbnail: ResolvedClip | null;
}

// ---- API payloads ----

export interface PlayerReel {
  player: Player;
  clips: ResolvedClip[];
  held: ResolvedClip[];
  thumbnail: ResolvedClip | null;
}

export interface Health {
  totalClips: number;
  autoAccepted: number;
  /** Clips currently waiting for the coach. */
  queueSize: number;
  /** Share of clips that were flagged for review, 0 to 1. */
  flaggedShare: number;
  /** Players whose reel has no clips. */
  emptyReels: number;
  /** Parent reports on clips the system accepted without review. */
  reportsOnAutoAccepted: number;
}

export interface ReportEntry {
  clipId: string;
  playerNumber: number;
  playerName: string;
  confidence: number;
  moment: string;
  minute: number;
  createdAt: string;
}

export interface SessionState {
  sessionId: string;
  threshold: number;
  sentAt: string | null;
  roster: Player[];
  clips: ResolvedClip[];
  reels: PlayerReel[];
  reports: ReportEntry[];
  health: Health;
}

export interface SendResult {
  sentAt: string;
  families: number;
  heldClips: number;
}

export interface DecisionResult {
  /** True when the reels had already been sent, so the change reaches families as an update. */
  updatedAfterSend: boolean;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}
