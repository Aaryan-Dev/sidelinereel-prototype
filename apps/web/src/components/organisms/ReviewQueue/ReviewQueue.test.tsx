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
  reason: 'Below the 85% bar (81% sure)',
  playerNumber: null,
  heldFor: 14,
  ...over,
});

const noop = () => undefined;

describe('ReviewQueue', () => {
  it('shows what the system read and why it was held', () => {
    render(<ReviewQueue clips={[clip({})]} roster={roster} threshold={0.85} onDecide={noop} />);
    expect(screen.getByText('#14')).toBeInTheDocument();
    expect(screen.getByText(/System read/)).toHaveTextContent('System read #14 (81% sure)');
    expect(screen.getByText('Held: Below the 85% bar (81% sure)')).toBeInTheDocument();
  });

  it('explains a clip held although its confidence is above the bar', () => {
    render(
      <ReviewQueue
        clips={[
          clip({ confidence: 0.91, reason: 'Similar numbers on the roster: #11, #14, #41' }),
        ]}
        roster={roster}
        threshold={0.85}
        onDecide={noop}
      />,
    );
    expect(screen.getByText(/Similar numbers on the roster/)).toBeInTheDocument();
    expect(screen.getByText('Above the 85% bar, but held for a coach check.')).toBeInTheDocument();
  });

  it('does not say "above the bar" for a clip that is below it', () => {
    render(<ReviewQueue clips={[clip({})]} roster={roster} threshold={0.85} onDecide={noop} />);
    expect(screen.queryByText(/Above the/)).not.toBeInTheDocument();
  });

  it('shows the number on the jersey in the footage frame', () => {
    render(<ReviewQueue clips={[clip({})]} roster={roster} threshold={0.85} onDecide={noop} />);
    expect(screen.getByRole('img', { name: /wearing number 4/ })).toBeInTheDocument();
  });

  it('reports the decision with the clip id', async () => {
    const onDecide = vi.fn();
    render(<ReviewQueue clips={[clip({})]} roster={roster} threshold={0.85} onDecide={onDecide} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Exclude clip' }));
    expect(onDecide).toHaveBeenCalledWith('c1', { action: 'exclude' });
  });

  it('offers no Confirm for a number that is not on the roster', () => {
    render(
      <ReviewQueue
        clips={[clip({ detected: 32 })]}
        roster={roster}
        threshold={0.85}
        onDecide={noop}
      />,
    );
    expect(screen.queryByRole('button', { name: /Confirm/ })).not.toBeInTheDocument();
  });

  it('says so when the queue is empty', () => {
    render(<ReviewQueue clips={[]} roster={roster} threshold={0.85} onDecide={noop} />);
    expect(screen.getByText('Nothing waiting for you')).toBeInTheDocument();
  });

  it('shows a shimmer instead of the clips while recalculating', () => {
    render(
      <ReviewQueue clips={[clip({})]} roster={roster} threshold={0.85} loading onDecide={noop} />,
    );
    expect(screen.getByTestId('queue-loading')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: 'Exclude clip' })).not.toBeInTheDocument();
    expect(screen.queryByText('#14')).not.toBeInTheDocument();
  });
});
