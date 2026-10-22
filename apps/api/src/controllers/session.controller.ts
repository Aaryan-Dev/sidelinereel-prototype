import type { Request, Response } from 'express';
import { sessionIdParams, thresholdBody } from '../schemas/session.schemas';
import type { SessionService } from '../services/session.service';

export function createSessionController(service: SessionService) {
  return {
    async create(_req: Request, res: Response) {
      res.status(201).json(await service.create());
    },
    async state(req: Request, res: Response) {
      const { id } = sessionIdParams.parse(req.params);
      res.json(await service.getState(id));
    },
    async setThreshold(req: Request, res: Response) {
      const { id } = sessionIdParams.parse(req.params);
      const { threshold } = thresholdBody.parse(req.body);
      res.json(await service.setThreshold(id, threshold));
    },
    async reset(req: Request, res: Response) {
      const { id } = sessionIdParams.parse(req.params);
      res.json(await service.reset(id));
    },
    async send(req: Request, res: Response) {
      const { id } = sessionIdParams.parse(req.params);
      res.json(await service.send(id));
    },
  };
}
