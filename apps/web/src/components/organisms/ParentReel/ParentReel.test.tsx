import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlayerReel, ResolvedClip } from '@sidelinereel/shared';
import { ParentReel } from './ParentReel';

const clip = (over: Partial<ResolvedClip>): ResolvedClip => ({
  id: 'c1',
  minute: 49,
  moment: 'Goal',
  detected: 9,
  confidence: 0.92,
  frameNumber: 7,
  status: 'auto',
  reason: '',
  playerNumber: 9,
  ...over,
});

const reel = (over: Partial<PlayerReel> = {}): PlayerReel => ({
  player: { number: 9, name: 'Lila Ortiz' },
  clips: [clip({})],
  held: [],
  thumbnail: clip({}),
  ...over,
});

describe('ParentReel', () => {
  it('lets a parent report a clip that is not their kid', async () => {
    const onReport = vi.fn();
    render(<ParentReel reel={reel()} sent onReport={onReport} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /isn't my kid/ }));
    expect(onReport).toHaveBeenCalledWith('c1');
  });

  it('explains clips that are waiting for the coach', () => {
    render(<ParentReel reel={reel({ clips: [], thumbnail: null, held: [clip({ id: 'h' })] })} sent onReport={() => undefined} />);
    expect(screen.getByText(/being checked by the coach/)).toBeInTheDocument();
    expect(screen.getByText('Nothing in this reel yet')).toBeInTheDocument();
  });

  it('marks the view as a preview until the recap is sent', () => {
    render(<ParentReel reel={reel()} sent={false} onReport={() => undefined} />);
    expect(screen.getByText(/Preview/)).toBeInTheDocument();
  });

  it('shows no preview notice after the send', () => {
    render(<ParentReel reel={reel()} sent onReport={() => undefined} />);
    expect(screen.queryByText(/Preview/)).not.toBeInTheDocument();
  });
});
