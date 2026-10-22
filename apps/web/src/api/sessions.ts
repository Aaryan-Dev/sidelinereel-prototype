import type { Decision, DecisionResult, SendResult, SessionState } from '@sidelinereel/shared';
import { request } from './client';

const s = (id: string) => `/sessions/${id}`;

export const sessionsApi = {
  create: () => request<{ sessionId: string }>('POST', '/sessions'),
  state: (id: string) => request<SessionState>('GET', `${s(id)}/state`),
  setThreshold: (id: string, threshold: number) =>
    request<SessionState>('PATCH', s(id), { threshold }),
  reset: (id: string) => request<SessionState>('POST', `${s(id)}/reset`),
  send: (id: string) => request<SendResult>('POST', `${s(id)}/send`),
  decide: (id: string, clipId: string, decision: Decision) =>
    request<DecisionResult>('PUT', `${s(id)}/clips/${clipId}/decision`, decision),
  undo: (id: string, clipId: string) =>
    request<DecisionResult>('DELETE', `${s(id)}/clips/${clipId}/decision`),
  report: (id: string, clipId: string) =>
    request<{ ok: true }>('POST', `${s(id)}/clips/${clipId}/reports`),
};
