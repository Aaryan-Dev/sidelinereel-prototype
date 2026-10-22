import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ResolvedClip } from '@sidelinereel/shared';
import { ReviewQueue } from './ReviewQueue';

const roster = [
  { number: 4, name: 'Sofia Rivera' },
  { number: 14, name: 'Lucy Grant' },
];

const clip = (over: Partial<ResolvedClip>): ResolvedClip => ({
  id: 'c1',
  minute: 4,
  moment: 'Goal',
  detected: 14,
  confidence: 0.81,
  frameNumber: 4,
  status: 'review',
  reason: 'Low confidence (81%)',
  playerNumber: null,
  heldFor: 14,
  ...over,
});

describe('ReviewQueue', () => {
  it('shows what the system read and why it was flagged', () => {
    render(<ReviewQueue clips={[clip({})]} roster={roster} onDecide={() => undefined} />);
    expect(screen.getByText('#14')).toBeInTheDocument();
    expect(screen.getByText(/81% sure/)).toBeInTheDocument();
    expect(screen.getByText('Low confidence (81%)')).toBeInTheDocument();
  });

  it('shows the number on the jersey in the footage frame', () => {
    render(<ReviewQueue clips={[clip({})]} roster={roster} onDecide={() => undefined} />);
    expect(screen.getByRole('img', { name: /wearing number 4/ })).toBeInTheDocument();
  });

  it('reports the decision with the clip id', async () => {
    const onDecide = vi.fn();
    render(<ReviewQueue clips={[clip({})]} roster={roster} onDecide={onDecide} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Exclude clip' }));
    expect(onDecide).toHaveBeenCalledWith('c1', { action: 'exclude' });
  });

  it('offers no Confirm for a number that is not on the roster', () => {
    render(
      <ReviewQueue clips={[clip({ detected: 32 })]} roster={roster} onDecide={() => undefined} />,
    );
    expect(screen.queryByRole('button', { name: /Confirm/ })).not.toBeInTheDocument();
  });

  it('says so when the queue is empty', () => {
    render(<ReviewQueue clips={[]} roster={roster} onDecide={() => undefined} />);
    expect(screen.getByText('Nothing waiting for you')).toBeInTheDocument();
  });
});
