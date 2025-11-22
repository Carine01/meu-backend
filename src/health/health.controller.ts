import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * Health check endpoint - Readiness probe
   * 
   * Usado por Kubernetes/Cloud Run para verificar se o serviço está pronto.
   * Retorna 200 OK se a aplicação está respondendo.
   * 
   * 🔓 PÚBLICO - Não requer autenticação
   * 
   * @returns Status OK e timestamp
   * 
   * @example
   * GET /health
   * 
   * Response:
   * {
   *   "status": "ok",
   *   "timestamp": "2025-11-22T01:00:00.000Z"
   * }
   */
  @Get()
  readiness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Liveness probe
   * 
   * Usado por Kubernetes/Cloud Run para verificar se o container está vivo.
   * Se retornar erro, o container será reiniciado.
   * 
   * 🔓 PÚBLICO - Não requer autenticação
   * 
   * @returns Status alive
   * 
   * @example
   * GET /health/liveness
   * 
   * Response:
   * {
   *   "status": "alive"
   * }
   */
  @Get('liveness')
  liveness() {
    return { status: 'alive' };
  }
}

