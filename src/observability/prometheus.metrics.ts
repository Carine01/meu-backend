import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

export const loginAttempts = new Counter({
  name: 'login_attempts_total',
  help: 'Total de tentativas de login',
});

export const loginFailures = new Counter({
  name: 'login_failures_total',
  help: 'Total de falhas de login',
});

export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em ms',
  labelNames: ['method', 'route', 'code'],
});
