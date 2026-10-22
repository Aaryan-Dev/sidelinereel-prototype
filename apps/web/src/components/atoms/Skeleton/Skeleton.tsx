import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
}

/** A shimmering placeholder block. Decorative, so hidden from screen readers. */
export function Skeleton({ width = '100%', height = 14, radius }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
