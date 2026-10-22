import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { createClipController } from '../controllers/clip.controller';
import type { createSessionController } from '../controllers/session.controller';

interface Deps {
  sessions: ReturnType<typeof createSessionController>;
  clips: ReturnType<typeof createClipController>;
  /** Extra limiter for creating sessions, which writes to the database. */
  createLimiter: RequestHandler;
}

export function createSessionsRouter({ sessions, clips, createLimiter }: Deps): Router {
  const router = Router();
  router.post('/', createLimiter, sessions.create);
  router.get('/:id/state', sessions.state);
  router.patch('/:id', sessions.setThreshold);
  router.post('/:id/reset', sessions.reset);
  router.post('/:id/send', sessions.send);
  router.put('/:id/clips/:clipId/decision', clips.decide);
  router.delete('/:id/clips/:clipId/decision', clips.undo);
  router.post('/:id/clips/:clipId/reports', clips.report);
  return router;
}
