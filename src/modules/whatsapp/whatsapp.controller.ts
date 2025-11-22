import { Controller, Post, Body, Get, Param, Logger, UseGuards, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendWhatsAppDto, SendWhatsAppResponseDto, WhatsAppHealthDto } from '../../dto/send-whatsapp.dto';

@ApiTags('WhatsApp')
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
   * @param body - DTO com validação completa
   * @param clinicIdHeader - Header x-clinic-id (opcional, fallback para body.clinicId)
   * @returns Resultado do envio (messageId, status, timestamp)
   * @throws UnauthorizedException se token inválido
   * @throws BadRequestException se validação falhar
   * 
   * @example
   * POST /whatsapp/send
   * Authorization: Bearer <token>
   * x-clinic-id: elevare-01
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Enviar mensagem WhatsApp',
    description: 'Envia mensagem de texto via WhatsApp com persistência e auditoria. Suporta multitenancy via clinicId.',
  })
  @ApiHeader({
    name: 'x-clinic-id',
    description: 'ID da clínica (opcional, fallback para body.clinicId ou default)',
    required: false,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensagem enviada com sucesso',
    type: SendWhatsAppResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 500, description: 'Erro ao enviar mensagem' })
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() body: SendWhatsAppDto,
    @Headers('x-clinic-id') clinicIdHeader?: string,
  ): Promise<SendWhatsAppResponseDto> {
    // Prioridade: header > body > default
    const clinicId = clinicIdHeader || body.clinicId || 'ELEVARE_MAIN';
    
    const result = await this.whatsappService.sendTextMessage(
      body.to, 
      body.message,
      clinicId,
      undefined, // userId - pode ser extraído do JWT no futuro
      body.metadata,
    );
    
    return {
      messageId: result.messageId,
      status: result.status,
      timestamp: result.timestamp,
      providerMessageId: result.messageId,
    };
  }

  /**
   * Verifica se número tem WhatsApp
   * PROTEGIDO: Requer autenticação JWT
   */
  @Get('check/:phoneNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Verificar número WhatsApp',
    description: 'Verifica se um número de telefone possui WhatsApp ativo',
  })
  @ApiResponse({ status: 200, description: 'Verificação realizada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async checkNumber(@Param('phoneNumber') phoneNumber: string) {
    const hasWhatsApp = await this.whatsappService.isWhatsAppNumber(phoneNumber);
    return { phoneNumber, hasWhatsApp };
  }

  /**
   * Health check do serviço WhatsApp
   * NÃO requer autenticação (para monitoramento)
   * 
   * @returns Status do provider e conexão
   * 
   * @example
   * GET /whatsapp/health
   * Response:
   * {
   *   "status": "ok",
   *   "provider": "baileys",
   *   "connected": true,
   *   "info": { ... }
   * }
   */
  @Get('health')
  @ApiOperation({ 
    summary: 'Health check do WhatsApp',
    description: 'Verifica status de conexão e disponibilidade do serviço WhatsApp',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status do serviço',
    type: WhatsAppHealthDto,
  })
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<WhatsAppHealthDto> {
    // TODO: Implementar verificação real de conexão do provider
    // Por enquanto retorna status básico
    const provider = process.env.WHATSAPP_PROVIDER || 'baileys';
    
    this.logger.debug('Health check solicitado');
    
    return {
      status: 'ok',
      provider,
      connected: true, // TODO: verificar conexão real com Baileys
      info: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}

