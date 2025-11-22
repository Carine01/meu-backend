// src/services/cron.service.ts
import cron from 'node-cron';
import pRetry from 'p-retry';
import { getLogger } from '../lib/logger';

type TaskFn = () => Promise<void>;

interface CronTask {
  name: string;
  schedule: string;
  task: TaskFn;
  retry?: { retries: number; factor?: number };
}

const tasks: CronTask[] = [];
const baseLogger = getLogger('cron');

export function registerCronTask(t: CronTask) {
  tasks.push(t);
  baseLogger.info({ task: t.name, schedule: t.schedule }, 'cron task registered');
}

export function startCron() {
  tasks.forEach((t) => {
    cron.schedule(
      t.schedule,
      async () => {
        const correlationId = `cron-${t.name}-${Date.now()}`;
        const logger = getLogger('cron', correlationId);
        logger.info({ name: t.name }, 'cron triggered');

        const runner = async () => {
          try {
            await t.task();
            logger.info({ name: t.name }, 'cron success');
          } catch (err) {
            logger.error({ err: (err as Error).message || err, name: t.name }, 'cron task error');
            throw err;
          }
        };

        try {
          await pRetry(runner, {
            onFailedAttempt: (error) => {
              logger.warn({ attempts: error.attemptNumber, retriesLeft: error.retriesLeft }, 'retrying cron task');
            },
            retries: t.retry?.retries ?? 2,
            factor: t.retry?.factor ?? 2,
          });
        } catch (finalErr) {
          logger.error({ err: (finalErr as Error).message || finalErr }, 'cron failed after retries');
          // opcional: integração com Sentry/Alert
        }
      },
      { timezone: process.env.TZ || 'America/Sao_Paulo' }
    );
    baseLogger.debug({ task: t.name }, 'cron scheduled');
  });
}
