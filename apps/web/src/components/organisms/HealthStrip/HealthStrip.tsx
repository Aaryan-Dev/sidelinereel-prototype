import type { Health } from '@sidelinereel/shared';
import { percent } from '../../../lib/format';
import { StatTile } from '../../molecules';
import styles from './HealthStrip.module.css';

/** The signals that show whether the fix is working, one per failure mode in the spec. */
export function HealthStrip({ health }: { health: Health }) {
  return (
    <section className={styles.strip} aria-label="Review health">
      <StatTile
        label="Waiting for the coach"
        value={health.queueSize}
        hint="Held out of reels until resolved"
        tone={health.queueSize > 0 ? 'warning' : 'default'}
      />
      <StatTile
        label="Players with an empty reel"
        value={health.emptyReels}
        hint="Risk: coaches don't clear the queue"
        tone={health.emptyReels > 0 ? 'warning' : 'default'}
      />
      <StatTile
        label="Clips flagged for review"
        value={percent(health.flaggedShare)}
        hint="Too high overloads coaches"
      />
      <StatTile
        label="Parent reports on auto-accepted clips"
        value={health.reportsOnAutoAccepted}
        hint="Risk: confident wrong matches"
        tone={health.reportsOnAutoAccepted > 0 ? 'danger' : 'default'}
      />
    </section>
  );
}
