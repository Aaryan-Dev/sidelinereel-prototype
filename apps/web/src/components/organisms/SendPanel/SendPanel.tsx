import { pluralize } from '../../../lib/format';
import { Badge, Button } from '../../atoms';
import styles from './SendPanel.module.css';

interface SendPanelProps {
  sentAt: string | null;
  queueSize: number;
  sending: boolean;
  onSend: () => void;
}

export function SendPanel({ sentAt, queueSize, sending, onSend }: SendPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="send-heading">
      <div className={styles.text}>
        <h2 id="send-heading">Weekly recap</h2>
        <p className={styles.line}>
          {queueSize > 0
            ? `${pluralize(queueSize, 'clip')} still waiting for the coach. The recap goes out on schedule without them.`
            : 'Every clip is resolved. The recap has everything.'}
        </p>
        {sentAt && (
          <p className={styles.line}>
            <Badge tone="success">Sent</Badge> at {new Date(sentAt).toLocaleTimeString()}. Resolving
            clips now updates the affected reels.
          </p>
        )}
      </div>
      <Button variant="primary" onClick={onSend} disabled={sending}>
        {sentAt ? 'Send again' : 'Send weekly recap now'}
      </Button>
    </section>
  );
}
