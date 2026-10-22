import { percent } from '../../../lib/format';
import { Slider } from '../../atoms';
import styles from './ThresholdControl.module.css';

interface ThresholdControlProps {
  threshold: number;
  onCommit: (threshold: number) => void;
  /** The new bar is being applied; the lists above are recalculating. */
  saving?: boolean;
}

export function ThresholdControl({ threshold, onCommit, saving }: ThresholdControlProps) {
  return (
    <section className={styles.box} aria-label="Auto-accept threshold">
      <Slider
        label="Confidence needed to auto-accept"
        value={threshold}
        min={0.5}
        max={0.99}
        step={0.01}
        format={percent}
        onCommit={onCommit}
        disabled={saving}
      />
      <p className={styles.status} role="status">
        {saving ? 'Updating the lists…' : ' '}
      </p>
      <p className={styles.hint}>
        A clip is auto-accepted only when the system is at least this sure <strong>and</strong> the
        roster has no similar number (like #1 and #11, or #4 and #14). Similar numbers always go to
        the coach, however sure the system is. This is a prototype setting: raise it and more clips
        go to the coach (more review work, fewer wrong matches); lower it and fewer are held (less
        work, more risk). The real value is set with engineering.
      </p>
    </section>
  );
}
