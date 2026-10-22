import { percent } from '../../../lib/format';
import { Slider } from '../../atoms';
import styles from './ThresholdControl.module.css';

interface ThresholdControlProps {
  threshold: number;
  onCommit: (threshold: number) => void;
}

export function ThresholdControl({ threshold, onCommit }: ThresholdControlProps) {
  return (
    <section className={styles.box} aria-label="Auto-accept threshold">
      <Slider
        label="Auto-accept at or above"
        value={threshold}
        min={0.5}
        max={0.99}
        step={0.01}
        format={percent}
        onCommit={onCommit}
      />
      <p className={styles.hint}>
        Prototype setting. Raise it to send more clips to the coach (more review work, fewer wrong
        matches). Lower it to review less (fewer clips held, more risk). The real value is set with
        engineering.
      </p>
    </section>
  );
}
