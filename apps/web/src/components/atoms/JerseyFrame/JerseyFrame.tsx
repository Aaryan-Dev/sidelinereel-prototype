import styles from './JerseyFrame.module.css';

interface JerseyFrameProps {
  /** The number visible on the jersey in this footage frame. */
  number: number;
  size?: 'sm' | 'md' | 'lg';
}

/** An illustration of a footage frame: a player on the pitch with their jersey number. */
export function JerseyFrame({ number, size = 'md' }: JerseyFrameProps) {
  const digits = String(number);
  return (
    <svg
      className={`${styles.frame} ${styles[size]}`}
      viewBox="0 0 120 80"
      role="img"
      aria-label={`Footage frame: player wearing number ${number}`}
    >
      <rect width="120" height="80" className={styles.pitch} />
      <path d="M0 62h120M60 62v18" className={styles.line} />
      <path
        className={styles.jersey}
        d="M44 18l-12 8 5 11 7-3v32h32V34l7 3 5-11-12-8c-3 5-8 7-16 7s-13-2-16-7z"
      />
      <circle cx="60" cy="11" r="6" className={styles.head} />
      <text
        x="60"
        y="54"
        textAnchor="middle"
        className={styles.number}
        fontSize={digits.length > 1 ? 20 : 24}
      >
        {digits}
      </text>
    </svg>
  );
}
