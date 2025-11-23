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
   * Endpoint de simulação para testes de produção
   * 
   * ⚠️ ATENÇÃO: Este endpoint NÃO tem autenticação para permitir testes automatizados
   * 
   * @param body - Corpo da requisição com mensagem de teste
   * @returns Resposta de sucesso com status "ok"
   * 
   * @example
   * POST /whatsapp/simulate
   * {
   *   "message": "Oi"
   * }
   * 
   * Response:
   * {
   *   "status": "ok",
   *   "message": "Simulação executada com sucesso",
   *   "timestamp": "2025-11-23T18:07:29.680Z"
   * }
   */
  @Post('simulate')
  async simulate(@Body() body: { message?: string }) {
    // Validação de entrada
    if (body.message && body.message.length > 100) {
      return {
        status: 'error',
        message: 'Mensagem muito longa (máximo 100 caracteres)'
      };
    }

    this.logger.log(`🧪 Simulação de teste recebida`);
    
    return {
      status: 'ok',
      message: 'Simulação executada com sucesso',
      timestamp: new Date().toISOString()
    };
  }
}

