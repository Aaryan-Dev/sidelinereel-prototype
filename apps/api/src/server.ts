import 'dotenv/config';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { createLogger } from './lib/logger';
import { createPrisma } from './lib/prisma';
import { createClipRepository } from './repositories/clip.repo';
import { createSessionRepository } from './repositories/session.repo';
import { createReportService } from './services/report.service';
import { createReviewService } from './services/review.service';
import { createSessionService } from './services/session.service';

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL, env.NODE_ENV === 'development');
const db = createPrisma();

const sessionRepo = createSessionRepository(db);
const clipRepo = createClipRepository(db);

const app = createApp({
  sessionService: createSessionService(sessionRepo),
  reviewService: createReviewService(sessionRepo, clipRepo),
  reportService: createReportService(sessionRepo, clipRepo),
  logger,
  corsOrigins: env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  trustProxy: env.TRUST_PROXY,
});

const server = app.listen(env.PORT, () => logger.info(`API listening on :${env.PORT}`));

// Cloud Run sends SIGTERM before stopping an instance; finish in-flight requests first.
function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
