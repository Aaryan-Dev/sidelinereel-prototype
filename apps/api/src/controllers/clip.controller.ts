import type { Request, Response } from 'express';
import { clipParams, decisionBody } from '../schemas/session.schemas';
import type { ReportService } from '../services/report.service';
import type { ReviewService } from '../services/review.service';

export function createClipController(review: ReviewService, reports: ReportService) {
  return {
    async decide(req: Request, res: Response) {
      const { id, clipId } = clipParams.parse(req.params);
      res.json(await review.decide(id, clipId, decisionBody.parse(req.body)));
    },
    async undo(req: Request, res: Response) {
      const { id, clipId } = clipParams.parse(req.params);
      res.json(await review.undo(id, clipId));
    },
    async report(req: Request, res: Response) {
      const { id, clipId } = clipParams.parse(req.params);
      await reports.report(id, clipId);
      res.status(201).json({ ok: true });
    },
  };
}
