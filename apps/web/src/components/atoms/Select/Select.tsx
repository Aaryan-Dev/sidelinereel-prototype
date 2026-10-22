import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: Option[];
  placeholder?: string;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
}

export function Select({ label, options, placeholder, hideLabel, className, ...rest }: SelectProps) {
  const id = useId();
  return (
    <div className={`${styles.field} ${className ?? ''}`}>
      <label htmlFor={id} className={hideLabel ? styles.hidden : styles.label}>
        {label}
      </label>
      <select id={id} className={styles.select} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
