import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMinimumDuration } from './useMinimumDuration';

describe('useMinimumDuration', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('is off until activated', () => {
    const { result } = renderHook(() => useMinimumDuration(false, 600));
    expect(result.current).toBe(false);
  });

  it('stays on for the minimum time after a fast request finishes', () => {
    const { result, rerender } = renderHook(({ active }) => useMinimumDuration(active, 600), {
      initialProps: { active: true },
    });
    expect(result.current).toBe(true);

    act(() => vi.advanceTimersByTime(100));
    rerender({ active: false }); // the request finished after 100ms
    expect(result.current).toBe(true); // still showing

    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(2));
    expect(result.current).toBe(false);
  });

  it('turns off at once when the request already took longer than the minimum', () => {
    const { result, rerender } = renderHook(({ active }) => useMinimumDuration(active, 600), {
      initialProps: { active: true },
    });
    act(() => vi.advanceTimersByTime(900));
    rerender({ active: false });
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });
});
