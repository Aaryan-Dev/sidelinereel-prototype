import { useEffect, useId, useState } from 'react';
import styles from './Slider.module.css';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  /** Called when the user releases the thumb or finishes a key press, not on every tick. */
  onCommit: (value: number) => void;
  disabled?: boolean;
}

export function Slider({ label, value, min, max, step, format, onCommit, disabled }: SliderProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} <output className={styles.value}>{format(draft)}</output>
      </label>
      <input
        id={id}
        type="range"
        className={styles.input}
        min={min}
        max={max}
        step={step}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
      />
    </div>
  );
}
