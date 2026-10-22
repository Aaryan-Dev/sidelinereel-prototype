import type { Decision, Player, ResolvedClip } from '@sidelinereel/shared';
import { percent } from '../../../lib/format';
import { Badge, JerseyFrame } from '../../atoms';
import { ClipCardSkeleton, ClipMeta, DecisionActions, EmptyState } from '../../molecules';
import styles from './ReviewQueue.module.css';

interface ReviewQueueProps {
  clips: ResolvedClip[];
  roster: Player[];
  /** The current auto-accept bar, used to explain clips held despite a high confidence. */
  threshold: number;
  /** The list is being recalculated (for example after the bar moved): show shimmer. */
  loading?: boolean;
  /** Clip with a request in flight; its actions are disabled. */
  busyClipId?: string | null;
  onDecide: (clipId: string, decision: Decision) => void;
}

export function ReviewQueue({
  clips,
  roster,
  threshold,
  loading,
  busyClipId,
  onDecide,
}: ReviewQueueProps) {
  if (loading) {
    return (
      <ul
        className={styles.list}
        aria-label="Clips waiting for review"
        aria-busy="true"
        data-testid="queue-loading"
      >
        {Array.from({ length: Math.min(Math.max(clips.length, 2), 6) }, (_, i) => (
          <ClipCardSkeleton key={i} />
        ))}
      </ul>
    );
  }

  if (clips.length === 0) {
    return (
      <EmptyState title="Nothing waiting for you">
        Every clip from this game has been matched or resolved.
      </EmptyState>
    );
  }

  return (
    <ul className={styles.list} aria-label="Clips waiting for review">
      {clips.map((clip) => (
        <li key={clip.id} className={styles.card}>
          <JerseyFrame number={clip.frameNumber} size="md" />
          <div className={styles.body}>
            <ClipMeta moment={clip.moment} minute={clip.minute} />
            <p className={styles.read}>
              System read <strong>#{clip.detected}</strong> ({percent(clip.confidence)} sure)
            </p>
            <Badge tone="warning">Held: {clip.reason}</Badge>
            {clip.confidence >= threshold && (
              <p className={styles.note}>
                Above the {percent(threshold)} bar, but held for a coach check.
              </p>
            )}
            <div className={styles.actions}>
              <DecisionActions
                detected={clip.detected}
                roster={roster}
                canConfirm={roster.some((p) => p.number === clip.detected)}
                disabled={busyClipId === clip.id}
                onDecide={(d) => onDecide(clip.id, d)}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
