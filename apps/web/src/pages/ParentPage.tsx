import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { SessionState } from '@sidelinereel/shared';
import { useReport } from '../api/hooks';
import { PlayerPicker } from '../components/molecules';
import { ParentReel } from '../components/organisms';
import styles from './pages.module.css';

export function ParentPage() {
  const state = useOutletContext<SessionState>();
  const report = useReport();
  // Start on #14: the Ridgeline parent in the support ticket.
  const [selected, setSelected] = useState<number>(
    state.roster.find((p) => p.number === 14)?.number ?? state.roster[0]?.number ?? 0,
  );
  const reel = state.reels.find((r) => r.player.number === selected);

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Step 3 · Parent view</p>
        <h1>What a family sees</h1>
        <p className={styles.lede}>
          Pick a child to see their reel. Try #9: one clip in it is actually #7, and the system was
          confident, so only the parent can catch it.
        </p>
      </div>
      <div className={styles.picker}>
        <PlayerPicker
          label="Viewing as the parent of"
          roster={state.roster}
          value={selected}
          onChange={(n) => n !== null && setSelected(n)}
        />
      </div>
      {reel && (
        <ParentReel
          reel={reel}
          sent={state.sentAt !== null}
          busyClipId={report.isPending ? report.variables : null}
          onReport={(clipId) => report.mutate(clipId)}
        />
      )}
    </div>
  );
}
