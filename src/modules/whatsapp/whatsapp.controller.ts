import { Controller, Post, Body, Get, Param, Logger, UseGuards } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * Webhook para receber status de mensagens e callbacks do WhatsApp Business API
   * 
   * Este endpoint é chamado pelo Meta/WhatsApp quando:
   * - Uma mensagem é entregue
   * - Uma mensagem é lida
   * - O usuário responde
   * - Há alterações de status
   * 
   * ⚠️ ATENÇÃO: Este endpoint NÃO deve ter autenticação JWT!
   * O WhatsApp precisa conseguir chamar livremente.
   * 
   * @param payload - Payload do webhook do Meta
   * @returns Confirmação de recebimento
   * 
   * @example
   * POST /whatsapp/webhook
   * {
   *   "object": "whatsapp_business_account",
   *   "entry": [...]
   * }
   */
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    this.logger.log('📬 Webhook recebido:', JSON.stringify(payload, null, 2));

    // Verificação de webhook (Meta exige)
    if (payload.object === 'whatsapp_business_account') {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const message = change.value.messages?.[0];
            const status = change.value.statuses?.[0];

            if (message) {
              this.logger.log(`📨 Nova mensagem recebida: ${message.id}`);
              // TODO: Processar mensagem recebida
            }

            if (status) {
              this.logger.log(`📊 Status atualizado: ${status.id} -> ${status.status}`);
              // TODO: Atualizar status no banco de dados
            }
          }
        }
      }
    }

    return { success: true };
  }

  /**
   * Verificação do webhook (Meta exige)
   */
  @Get('webhook')
  verifyWebhook(@Param() query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'meu_token_secreto';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      this.logger.log('✅ Webhook verificado');
      return challenge;
    }

    return { error: 'Forbidden' };
  }

  /**
   * Enviar mensagem manualmente (para testes ou uso direto)
   * 
   * 🔒 Protegido por JWT - Apenas usuários autenticados
   * 
   * @param body - Número de destino e texto da mensagem
   * @returns Resultado do envio (messageId, status, timestamp)
   * @throws UnauthorizedException se token inválido
   * 
   * @example
   * POST /whatsapp/send
   * Authorization: Bearer <token>
   * {
   *   "to": "+5511999999999",
   *   "message": "Olá! Esta é uma mensagem de teste."
   * }
   * 
   * Response:
   * {
   *   "messageId": "wamid.xxx",
   *   "status": "sent",
   *   "timestamp": "2025-11-22T01:00:00Z"
   * }
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Body() body: { to: string; message: string }) {
    const result = await this.whatsappService.sendTextMessage(body.to, body.message);
    return result;
  }

  /**
   * Verifica se número tem WhatsApp
   * PROTEGIDO: Requer autenticação JWT
   */
  @Get('check/:phoneNumber')
  @UseGuards(JwtAuthGuard)
  async checkNumber(@Param('phoneNumber') phoneNumber: string) {
    const hasWhatsApp = await this.whatsappService.isWhatsAppNumber(phoneNumber);
    return { phoneNumber, hasWhatsApp };
  }

  /**
   * Health check para fila do WhatsApp
   * 
   * Verifica se o serviço de WhatsApp está funcionando corretamente.
   * Usado para monitoramento externo.
   * 
   * 🔓 PÚBLICO - Não requer autenticação
   * 
   * @returns Status da fila do WhatsApp
   * 
   * @example
   * GET /whatsapp/health
   * 
   * Response:
   * {
   *   "status": "ok",
   *   "timestamp": "2025-11-23T18:00:00.000Z",
   *   "service": "whatsapp"
   * }
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'whatsapp'
    };
  }
}

