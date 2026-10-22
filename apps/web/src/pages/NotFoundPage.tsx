import { Link } from 'react-router-dom';
import styles from './pages.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1>Page not found</h1>
      <p>
        <Link to="/review">Back to coach review</Link>
      </p>
    </div>
  );
}
