import type { ReportEntry } from '@sidelinereel/shared';
import { percent } from '../../../lib/format';
import { EmptyState } from '../../molecules';
import styles from './ReportLog.module.css';

export function ReportLog({ reports }: { reports: ReportEntry[] }) {
  return (
    <section className={styles.section} aria-labelledby="reports-heading">
      <h2 id="reports-heading">Parent reports</h2>
      {reports.length === 0 ? (
        <EmptyState title="No reports yet">
          When a parent taps &ldquo;This isn&rsquo;t my kid&rdquo;, it shows up here with the match
          that was wrong.
        </EmptyState>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Clip</th>
                <th scope="col">Was in reel of</th>
                <th scope="col">System confidence</th>
                <th scope="col">Reported</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.clipId}>
                  <td>
                    {r.moment} {r.minute}&prime;
                  </td>
                  <td>
                    #{r.playerNumber} {r.playerName}
                  </td>
                  <td>{percent(r.confidence)}</td>
                  <td>{new Date(r.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
