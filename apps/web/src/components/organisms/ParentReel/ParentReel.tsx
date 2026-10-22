import type { PlayerReel } from '@sidelinereel/shared';
import { pluralize } from '../../../lib/format';
import { Button, JerseyFrame } from '../../atoms';
import { EmptyState, ReelClipRow } from '../../molecules';
import styles from './ParentReel.module.css';

interface ParentReelProps {
  reel: PlayerReel;
  /** Whether the weekly recap has been sent yet. Before that, this is a preview. */
  sent: boolean;
  busyClipId?: string | null;
  onReport: (clipId: string) => void;
}

export function ParentReel({ reel, sent, busyClipId, onReport }: ParentReelProps) {
  const { player, clips, held, thumbnail } = reel;
  return (
    <section className={styles.section} aria-label={`${player.name}'s reel`}>
      {!sent && (
        <p className={styles.preview}>
          Preview: the weekly recap hasn&rsquo;t been sent yet. This is what families will see.
        </p>
      )}
      <div className={styles.hero}>
        {thumbnail ? (
          <JerseyFrame number={thumbnail.frameNumber} size="lg" />
        ) : (
          <EmptyState title="No highlights yet" />
        )}
        <div>
          <h2>{player.name}&rsquo;s reel</h2>
          <p className={styles.count}>{pluralize(clips.length, 'highlight')} this week</p>
          {held.length > 0 && (
            <p className={styles.held}>
              {pluralize(held.length, 'possible highlight')} {held.length === 1 ? 'is' : 'are'} being
              checked by the coach before {held.length === 1 ? 'it is' : 'they are'} added.
            </p>
          )}
        </div>
      </div>

      {clips.length === 0 ? (
        <EmptyState title="Nothing in this reel yet">
          Highlights show up here once they&rsquo;re matched to {player.name}.
        </EmptyState>
      ) : (
        <ul className={styles.list} aria-label="Highlights">
          {clips.map((clip) => (
            <ReelClipRow
              key={clip.id}
              clip={clip}
              action={
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busyClipId === clip.id}
                  onClick={() => onReport(clip.id)}
                  aria-label={`This isn't my kid: ${clip.moment} at ${clip.minute} minutes`}
                >
                  This isn&rsquo;t my kid
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}
