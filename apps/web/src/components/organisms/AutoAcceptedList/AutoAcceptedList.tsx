import type { Player, ResolvedClip } from '@sidelinereel/shared';
import { findPlayer, percent, playerLabel } from '../../../lib/format';
import { Skeleton } from '../../atoms';
import { ClipRowSkeleton, ReelClipRow } from '../../molecules';
import styles from './AutoAcceptedList.module.css';

interface AutoAcceptedListProps {
  clips: ResolvedClip[];
  roster: Player[];
  /** The list is being recalculated: show shimmer in place of the count and rows. */
  loading?: boolean;
}

/** Clips the system matched on its own. Collapsed by default; the coach does not need to act on them. */
export function AutoAcceptedList({ clips, roster, loading }: AutoAcceptedListProps) {
  return (
    <details className={styles.details} aria-busy={loading || undefined}>
      <summary className={styles.summary}>
        Auto-accepted, no review needed{' '}
        {loading ? (
          <span className={styles.count}>
            <Skeleton width={28} height={16} radius={999} />
          </span>
        ) : (
          `(${clips.length})`
        )}
      </summary>
      <ul className={styles.list}>
        {loading
          ? Array.from({ length: Math.min(Math.max(clips.length, 2), 4) }, (_, i) => (
              <ClipRowSkeleton key={i} />
            ))
          : clips.map((clip) => {
              const player = findPlayer(roster, clip.playerNumber);
              return (
                <ReelClipRow
                  key={clip.id}
                  clip={clip}
                  note={`${player ? playerLabel(player) : 'Unknown'} · ${percent(clip.confidence)} sure`}
                />
              );
            })}
      </ul>
    </details>
  );
}
