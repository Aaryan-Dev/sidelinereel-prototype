import { Button } from '../../atoms';
import styles from './TopBar.module.css';

interface TopBarProps {
  onReset: () => void;
  resetting: boolean;
}

export function TopBar({ onReset, resetting }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          ▶
        </span>
        <div>
          <strong className={styles.name}>SidelineReel</strong>
          <p className={styles.sub}>Ridgeline U12 Falcons · vs Harbor City FC</p>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={onReset} disabled={resetting}>
        Reset demo
      </Button>
    </header>
  );
}
