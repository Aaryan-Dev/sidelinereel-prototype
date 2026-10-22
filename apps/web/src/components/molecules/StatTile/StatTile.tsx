import type { ReactNode } from 'react';
import styles from './StatTile.module.css';

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'warning' | 'danger';
}

export function StatTile({ label, value, hint, tone = 'default' }: StatTileProps) {
  return (
    <div className={`${styles.tile} ${tone !== 'default' ? styles[tone] : ''}`}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}
