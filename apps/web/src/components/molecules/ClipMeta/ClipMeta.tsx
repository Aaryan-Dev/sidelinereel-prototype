import styles from './ClipMeta.module.css';

export function ClipMeta({ moment, minute }: { moment: string; minute: number }) {
  return (
    <p className={styles.meta}>
      <strong>{moment}</strong> <span className={styles.minute}>{minute}&prime;</span>
    </p>
  );
}
