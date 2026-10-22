import { useState } from 'react';
import type { Decision, Player } from '@sidelinereel/shared';
import { Button } from '../../atoms';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';
import styles from './DecisionActions.module.css';

interface DecisionActionsProps {
  /** The number the system read for this clip. */
  detected: number;
  roster: Player[];
  /** False when the detected number is not on the roster, so there is nothing to confirm. */
  canConfirm: boolean;
  disabled?: boolean;
  onDecide: (decision: Decision) => void;
}

export function DecisionActions({
  detected,
  roster,
  canConfirm,
  disabled,
  onDecide,
}: DecisionActionsProps) {
  const [target, setTarget] = useState<number | null>(null);

  return (
    <div className={styles.actions}>
      {canConfirm && (
        <Button
          variant="primary"
          disabled={disabled}
          onClick={() => onDecide({ action: 'confirm' })}
        >
          Confirm #{detected}
        </Button>
      )}
      <div className={styles.reassign}>
        <PlayerPicker
          label="Reassign to"
          hideLabel
          placeholder="Reassign to…"
          roster={roster}
          value={target}
          onChange={setTarget}
          disabled={disabled}
        />
        <Button
          disabled={disabled || target === null}
          onClick={() => target !== null && onDecide({ action: 'reassign', to: target })}
        >
          Reassign
        </Button>
      </div>
      <Button variant="danger" disabled={disabled} onClick={() => onDecide({ action: 'exclude' })}>
        Exclude clip
      </Button>
    </div>
  );
}
