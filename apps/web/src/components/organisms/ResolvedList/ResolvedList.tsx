import type { Player, ResolvedClip } from '@sidelinereel/shared';
import { findPlayer, playerLabel } from '../../../lib/format';
import { Badge, Button } from '../../atoms';
import { ReelClipRow } from '../../molecules';
import styles from './ResolvedList.module.css';

interface ResolvedListProps {
  /** Clips the coach has confirmed, reassigned or excluded. */
  clips: ResolvedClip[];
  roster: Player[];
  onUndo: (clipId: string) => void;
}

function outcome(clip: ResolvedClip, roster: Player[]): string {
  const player = findPlayer(roster, clip.playerNumber);
  if (clip.status === 'excluded' || !player) return 'Removed from every reel';
  return clip.status === 'reassigned'
    ? `Moved to ${playerLabel(player)}`
    : `Confirmed for ${playerLabel(player)}`;
}

export function ResolvedList({ clips, roster, onUndo }: ResolvedListProps) {
  if (clips.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby="resolved-heading">
      <h2 id="resolved-heading">Resolved by you ({clips.length})</h2>
      <ul className={styles.list}>
        {clips.map((clip) => (
          <ReelClipRow
            key={clip.id}
            clip={clip}
            note={
              <>
                <Badge tone={clip.status === 'excluded' ? 'neutral' : 'success'}>
                  {clip.status === 'excluded' ? 'Excluded' : 'Resolved'}
                </Badge>{' '}
                {outcome(clip, roster)}
              </>
            }
            action={
              <Button size="sm" variant="ghost" onClick={() => onUndo(clip.id)}>
                Undo
              </Button>
            }
          />
        ))}
      </ul>
    </section>
  );
}
