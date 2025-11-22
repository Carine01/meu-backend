import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

/**
 * Serviço genérico para envio de webhooks para APIs externas
 * Exemplo: Make.com, Zapier, n8n, etc.
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookUrl: string;
  private readonly webhookToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get<string>('WEBHOOK_URL') || '';
    this.webhookToken = this.configService.get<string>('WEBHOOK_TOKEN') || '';
  }

  /**
   * Envia payload para webhook externo com autenticação Bearer token
   * @param payload Dados a serem enviados
   * @param customUrl URL customizada (opcional, sobrescreve WEBHOOK_URL do env)
   * @param customToken Token customizado (opcional, sobrescreve WEBHOOK_TOKEN do env)
   * @returns Response data do webhook
   */
  async sendWebhook(
    payload: any,
    customUrl?: string,
    customToken?: string,
  ): Promise<any> {
    const url = customUrl || this.webhookUrl;
    const token = customToken || this.webhookToken;

    if (!url) {
      throw new HttpException(
        'WEBHOOK_URL não configurado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.log(`Enviando webhook para ${url.substring(0, 50)}...`);

    try {
      const request$ = this.httpService
        .post(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Elevare-Backend/1.0',
          },
          timeout: 10000, // 10 segundos
        })
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response) {
              this.logger.error(
                `Erro HTTP ${error.response.status} ao enviar webhook: ${JSON.stringify(error.response.data)}`,
              );
              throw new HttpException(
                error.response.data || 'Erro ao enviar webhook',
                error.response.status,
              );
            } else {
              this.logger.error(`Erro de rede ao enviar webhook: ${error.message}`);
              throw new HttpException(
                'Falha de rede ao conectar com webhook',
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            }
          }),
        );

      const response = await firstValueFrom(request$);
      this.logger.log(`Webhook enviado com sucesso: HTTP ${response.status}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Envia webhook para Make.com especificamente
   * @param payload Dados do lead/evento
   */
  async sendToMake(payload: any): Promise<any> {
    const makeUrl = this.configService.get<string>('MAKE_WEBHOOK_URL');
    const makeToken = this.configService.get<string>('MAKE_TOKEN');
    
    if (!makeUrl) {
      this.logger.warn('MAKE_WEBHOOK_URL não configurado, pulando envio para Make.com');
      return { ok: false, message: 'Make.com não configurado' };
    }

    return this.sendWebhook(payload, makeUrl, makeToken);
  }

  /**
   * Envia webhook para Zapier especificamente
   * @param payload Dados do lead/evento
   */
  async sendToZapier(payload: any): Promise<any> {
    const zapierUrl = this.configService.get<string>('ZAPIER_WEBHOOK_URL');
    
    if (!zapierUrl) {
      this.logger.warn('ZAPIER_WEBHOOK_URL não configurado, pulando envio para Zapier');
      return { ok: false, message: 'Zapier não configurado' };
    }

    // Zapier geralmente não precisa de token, mas aceita se configurado
    return this.sendWebhook(payload, zapierUrl);
  }
}

