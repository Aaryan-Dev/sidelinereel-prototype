import type { Player, ResolvedClip } from '@sidelinereel/shared';
import { findPlayer, percent, playerLabel } from '../../../lib/format';
import { ReelClipRow } from '../../molecules';
import styles from './AutoAcceptedList.module.css';

interface AutoAcceptedListProps {
  clips: ResolvedClip[];
  roster: Player[];
}

/** Clips the system matched on its own. Collapsed by default; the coach does not need to act on them. */
export function AutoAcceptedList({ clips, roster }: AutoAcceptedListProps) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>Auto-accepted, no review needed ({clips.length})</summary>
      <ul className={styles.list}>
        {clips.map((clip) => {
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
