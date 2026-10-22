import type { Decision, Player, ResolvedClip } from '@sidelinereel/shared';
import { percent } from '../../../lib/format';
import { Badge } from '../../atoms';
import { ClipMeta, DecisionActions, EmptyState } from '../../molecules';
import { JerseyFrame } from '../../atoms';
import styles from './ReviewQueue.module.css';

interface ReviewQueueProps {
  clips: ResolvedClip[];
  roster: Player[];
  /** Clip with a request in flight; its actions are disabled. */
  busyClipId?: string | null;
  onDecide: (clipId: string, decision: Decision) => void;
}

export function ReviewQueue({ clips, roster, busyClipId, onDecide }: ReviewQueueProps) {
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
            <Badge tone="warning">{clip.reason}</Badge>
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
