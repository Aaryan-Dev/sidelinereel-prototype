import cors from 'cors';
import express, { type Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { createClipController } from './controllers/clip.controller';
import { createSessionController } from './controllers/session.controller';
import type { Logger } from './lib/logger';
import { createErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { createHealthRouter } from './routes/health.routes';
import { createSessionsRouter } from './routes/sessions.routes';
import type { ReportService } from './services/report.service';
import type { ReviewService } from './services/review.service';
import type { SessionService } from './services/session.service';

export interface AppDeps {
  sessionService: SessionService;
  reviewService: ReviewService;
  reportService: ReportService;
  logger: Logger;
  corsOrigins: string[];
  trustProxy: number;
  /** Turn off rate limiting (tests). */
  rateLimiting?: boolean;
}

export function createApp(deps: AppDeps): Express {
  const app = express();
  app.set('trust proxy', deps.trustProxy);
  app.disable('x-powered-by');

  app.use(
    pinoHttp({
      logger: deps.logger,
      autoLogging: { ignore: (req) => req.url === '/health' },
      // Keep log lines small: method, path and status are enough.
      serializers: {
        req: (req: { method: string; url: string }) => ({ method: req.method, url: req.url }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet());
  if (deps.corsOrigins.length) app.use(cors({ origin: deps.corsOrigins }));
  app.use(express.json({ limit: '10kb' }));

  const limiting = deps.rateLimiting ?? true;
  const passThrough: express.RequestHandler = (_req, _res, next) => next();
  const limiter = (windowMs: number, limit: number) =>
    limiting
      ? rateLimit({
          windowMs,
          limit,
          standardHeaders: 'draft-7',
          legacyHeaders: false,
          message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again soon.' } },
        })
      : passThrough;

  app.use(createHealthRouter());
  app.use(
    '/api/v1/sessions',
    limiter(60_000, 300),
    createSessionsRouter({
      sessions: createSessionController(deps.sessionService),
      clips: createClipController(deps.reviewService, deps.reportService),
      // Generous: behind a CDN many visitors can share one client IP.
      createLimiter: limiter(60 * 60_000, 120),
    }),
  );

  app.use(notFoundHandler);
  app.use(createErrorHandler(deps.logger));
  return app;
}
