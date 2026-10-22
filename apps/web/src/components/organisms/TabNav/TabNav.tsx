import { NavLink } from 'react-router-dom';
import styles from './TabNav.module.css';

export function TabNav({ queueSize }: { queueSize: number }) {
  const link = ({ isActive }: { isActive: boolean }) =>
    `${styles.tab} ${isActive ? styles.active : ''}`;
  return (
    <nav className={styles.nav} aria-label="Screens">
      <NavLink to="/review" className={link}>
        Coach review
        {queueSize > 0 && (
          <span className={styles.count} aria-label={`${queueSize} waiting`}>
            {queueSize}
          </span>
        )}
      </NavLink>
      <NavLink to="/reels" className={link}>
        Reels &amp; send
      </NavLink>
      <NavLink to="/parent" className={link}>
        Parent view
      </NavLink>
    </nav>
  );
}
