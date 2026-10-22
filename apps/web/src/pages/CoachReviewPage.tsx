import { useOutletContext } from 'react-router-dom';
import type { SessionState } from '@sidelinereel/shared';
import { useDecide, useThreshold, useUndo } from '../api/hooks';
import { pluralize } from '../lib/format';
import {
  AutoAcceptedList,
  ResolvedList,
  ReviewQueue,
  ThresholdControl,
} from '../components/organisms';
import styles from './pages.module.css';

const DECIDED = new Set(['confirmed', 'reassigned', 'excluded']);

export function CoachReviewPage() {
  const state = useOutletContext<SessionState>();
  const decide = useDecide();
  const undo = useUndo();
  const threshold = useThreshold();

  const queue = state.clips.filter((c) => c.status === 'review');
  const resolved = state.clips.filter((c) => DECIDED.has(c.status));
  const auto = state.clips.filter((c) => c.status === 'auto');

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Step 1 · Coach review</p>
        <h1>Check these before the weekly send</h1>
        <p className={styles.lede}>
          {queue.length > 0
            ? `${pluralize(queue.length, 'clip')} could belong to more than one player, so they are held out of every reel until you decide. Check the jersey in the frame, then confirm or move the clip.`
            : 'All clips are matched. Nothing is holding up the weekly recap.'}
        </p>
      </div>

      <ReviewQueue
        clips={queue}
        roster={state.roster}
        busyClipId={decide.isPending ? decide.variables?.clipId : null}
        onDecide={(clipId, decision) => decide.mutate({ clipId, decision })}
      />
      <ResolvedList clips={resolved} roster={state.roster} onUndo={(id) => undo.mutate(id)} />
      <AutoAcceptedList clips={auto} roster={state.roster} />
      <ThresholdControl
        threshold={state.threshold}
        onCommit={(value) => threshold.mutate(value)}
      />
    </div>
  );
}
