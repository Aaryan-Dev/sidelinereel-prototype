import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Decision, SessionState } from '@sidelinereel/shared';
import { useDemoSession } from '../features/session/SessionProvider';
import { useToast } from '../features/toast/ToastProvider';
import { ApiError } from './client';
import { sessionsApi } from './sessions';

const stateKey = (id: string | null) => ['session', id, 'state'] as const;

/** The session's full state. Recovers by starting a new session if the old one has expired. */
export function useSessionState() {
  const { sessionId, startNew } = useDemoSession();
  const query = useQuery({
    queryKey: stateKey(sessionId),
    queryFn: () => sessionsApi.state(sessionId!),
    enabled: sessionId !== null,
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });
  const expired = query.error instanceof ApiError && query.error.code === 'SESSION_NOT_FOUND';
  useEffect(() => {
    if (expired) void startNew();
  }, [expired, startNew]);
  return query;
}

function useSessionId(): string {
  const { sessionId } = useDemoSession();
  if (!sessionId) throw new Error('No active session');
  return sessionId;
}

function useRefreshState() {
  const qc = useQueryClient();
  const id = useSessionId();
  return () => qc.invalidateQueries({ queryKey: stateKey(id) });
}

export function useDecide() {
  const id = useSessionId();
  const refresh = useRefreshState();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ clipId, decision }: { clipId: string; decision: Decision }) =>
      sessionsApi.decide(id, clipId, decision),
    onSuccess: (result) => {
      if (result.updatedAfterSend) {
        toast('Reels were already sent. The affected families will get an updated reel.');
      }
      return refresh();
    },
  });
}

export function useUndo() {
  const id = useSessionId();
  const refresh = useRefreshState();
  return useMutation({
    mutationFn: (clipId: string) => sessionsApi.undo(id, clipId),
    onSuccess: refresh,
  });
}

export function useReport() {
  const id = useSessionId();
  const refresh = useRefreshState();
  const toast = useToast();
  return useMutation({
    mutationFn: (clipId: string) => sessionsApi.report(id, clipId),
    onSuccess: () => {
      toast("Thanks. We removed that clip from your reel and logged it for review.");
      return refresh();
    },
  });
}

export function useSend() {
  const id = useSessionId();
  const refresh = useRefreshState();
  const toast = useToast();
  return useMutation({
    mutationFn: () => sessionsApi.send(id),
    onSuccess: (r) => {
      toast(
        `Recap sent to ${r.families} families. ${r.heldClips} unresolved clip${r.heldClips === 1 ? ' was' : 's were'} left out.`,
      );
      return refresh();
    },
  });
}

export function useThreshold() {
  const id = useSessionId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threshold: number) => sessionsApi.setThreshold(id, threshold),
    onSuccess: (state: SessionState) => qc.setQueryData(stateKey(id), state),
  });
}

export function useReset() {
  const id = useSessionId();
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => sessionsApi.reset(id),
    onSuccess: (state: SessionState) => {
      qc.setQueryData(stateKey(id), state);
      toast('Demo reset to the original game.');
    },
  });
}
