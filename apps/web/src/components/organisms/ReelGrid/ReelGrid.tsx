import type { PlayerReel } from '@sidelinereel/shared';
import { playerLabel, pluralize } from '../../../lib/format';
import { Badge, JerseyFrame } from '../../atoms';
import { ReelClipRow } from '../../molecules';
import styles from './ReelGrid.module.css';

export function ReelGrid({ reels }: { reels: PlayerReel[] }) {
  return (
    <ul className={styles.grid} aria-label="Reels by player">
      {reels.map(({ player, clips, held, thumbnail }) => (
        <li key={player.number} className={styles.card}>
          <div className={styles.head}>
            {thumbnail ? (
              <JerseyFrame number={thumbnail.frameNumber} size="sm" />
            ) : (
              <div className={styles.noThumb} aria-label="No thumbnail">
                No
                <br />
                clips
              </div>
            )}
            <div>
              <h3>{playerLabel(player)}</h3>
              <p className={styles.count}>{pluralize(clips.length, 'clip')} in reel</p>
              {held.length > 0 && (
                <Badge tone="warning">{held.length} held for coach</Badge>
              )}
            </div>
          </div>
          {clips.length > 0 && (
            <details>
              <summary className={styles.summary}>Clips</summary>
              <ul className={styles.clips}>
                {clips.map((c) => (
                  <ReelClipRow
                    key={c.id}
                    clip={c}
                    note={c.status === 'auto' ? 'Auto-accepted' : 'Resolved by coach'}
                  />
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}
