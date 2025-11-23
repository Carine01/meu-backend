import { Controller, Post, Body, Get, Param, Logger, UseGuards, BadRequestException } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * Webhook para receber status de mensagens (WhatsApp Business API)
   * ATENÇÃO: Este endpoint NÃO deve ter autenticação (usado pelo WhatsApp)
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
   * Endpoint manual para testes
   * PROTEGIDO: Requer autenticação JWT
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
      throw new BadRequestException('Mensagem muito longa (máximo 100 caracteres)');
    }

    this.logger.log(`🧪 Simulação de teste recebida`);
    
    return {
      status: 'ok',
      message: 'Simulação executada com sucesso',
      timestamp: new Date().toISOString()
    };
  }
}

