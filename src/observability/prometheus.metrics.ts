import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

export const loginAttempts = new Counter({
  name: 'login_attempts_total',
  help: 'Total login attempts',
});

export const loginFailures = new Counter({
  name: 'login_failures_total',
  help: 'Total login failures',
});

export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'code'],
});
