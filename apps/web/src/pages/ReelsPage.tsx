import { useOutletContext } from 'react-router-dom';
import type { SessionState } from '@sidelinereel/shared';
import { useSend } from '../api/hooks';
import { HealthStrip, ReelGrid, ReportLog, SendPanel } from '../components/organisms';
import styles from './pages.module.css';

export function ReelsPage() {
  const state = useOutletContext<SessionState>();
  const send = useSend();

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Step 2 · Reels and send</p>
        <h1>Reels and weekly send</h1>
        <p className={styles.lede}>
          A reel only contains clips that are matched with confidence or confirmed by the coach.
          Unresolved clips are left out rather than guessed.
        </p>
      </div>
      <HealthStrip health={state.health} />
      <SendPanel
        sentAt={state.sentAt}
        queueSize={state.health.queueSize}
        sending={send.isPending}
        onSend={() => send.mutate()}
      />
      <ReelGrid reels={state.reels} />
      <ReportLog reports={state.reports} />
    </div>
  );
}
