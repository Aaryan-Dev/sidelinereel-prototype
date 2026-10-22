import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@sidelinereel/shared';
import { AppError } from '../lib/errors';
import type { Logger } from '../lib/logger';

const body = (code: string, message: string): ApiErrorBody => ({ error: { code, message } });

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(body('NOT_FOUND', 'Route not found.'));
};

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  // Express identifies error handlers by their four-argument signature.
  return (err, _req, res, _next) => {
    if (err instanceof AppError) {
      res.status(err.status).json(body(err.code, err.message));
      return;
    }
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => `${i.path.join('.') || 'request'}: ${i.message}`).join('; ');
      res.status(400).json(body('VALIDATION_ERROR', message));
      return;
    }
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json(body('INVALID_JSON', 'Request body is not valid JSON.'));
      return;
    }
    logger.error({ err }, 'unhandled error');
    res.status(500).json(body('INTERNAL', 'Something went wrong.'));
  };
}
