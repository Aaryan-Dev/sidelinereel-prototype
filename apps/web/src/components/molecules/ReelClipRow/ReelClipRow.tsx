import type { ReactNode } from 'react';
import type { ResolvedClip } from '@sidelinereel/shared';
import { JerseyFrame } from '../../atoms';
import { ClipMeta } from '../ClipMeta/ClipMeta';
import styles from './ReelClipRow.module.css';

interface ReelClipRowProps {
  clip: ResolvedClip;
  /** Extra text under the clip details, e.g. the status. */
  note?: ReactNode;
  action?: ReactNode;
}

export function ReelClipRow({ clip, note, action }: ReelClipRowProps) {
  return (
    <li className={styles.row}>
      <JerseyFrame number={clip.frameNumber} size="sm" />
      <div className={styles.body}>
        <ClipMeta moment={clip.moment} minute={clip.minute} />
        {note && <div className={styles.note}>{note}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </li>
  );
}
