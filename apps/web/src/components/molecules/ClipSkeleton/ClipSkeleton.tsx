import { Skeleton } from '../../atoms';
import styles from './ClipSkeleton.module.css';

/** Placeholder with the same shape as a review card, shown while the queue recalculates. */
export function ClipCardSkeleton() {
  return (
    <li className={styles.card} aria-hidden="true">
      <Skeleton width={136} height={91} radius={14} />
      <div className={styles.body}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="55%" height={26} radius={999} />
        <Skeleton width="70%" height={22} radius={999} />
        <div className={styles.actions}>
          <Skeleton width={120} height={46} radius={999} />
          <Skeleton width={190} height={46} radius={999} />
          <Skeleton width={110} height={46} radius={999} />
        </div>
      </div>
    </li>
  );
}

/** Placeholder with the same shape as a compact clip row. */
export function ClipRowSkeleton() {
  return (
    <li className={styles.row} aria-hidden="true">
      <Skeleton width={76} height={51} radius={10} />
      <div className={styles.body}>
        <Skeleton width="35%" height={14} />
        <Skeleton width="55%" height={12} />
      </div>
    </li>
  );
}
