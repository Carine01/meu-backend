import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from '../services/whatsapp.service';
import { SendWhatsAppDto, WhatsAppHealthDto } from '../dto/send-whatsapp.dto';

/**
 * WhatsAppController - Endpoints para envio de mensagens WhatsApp
 * 
 * Endpoints:
 * - POST /whatsapp/send - Envia mensagem WhatsApp
 * - GET /whatsapp/health - Verifica saúde do serviço
 */
@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * POST /whatsapp/send
   * Envia mensagem WhatsApp com validação e suporte a clinicId
   */
  @Post('send')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Envia mensagem WhatsApp',
    description: 'Envia mensagem WhatsApp via Baileys com enfileiramento e persistência. Suporta multitenancy via clinicId.',
  })
  @ApiHeader({
    name: 'x-clinic-id',
    description: 'ID da clínica (opcional, pode ser enviado no body)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Mensagem enviada com sucesso',
    schema: {
      example: {
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          id: 'msg-1234567890-abc123',
          clinicId: 'clinic-123',
          to: '+5511999999999',
          status: 'sent',
          sentAt: '2025-11-22T13:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço WhatsApp indisponível',
  })
  async sendMessage(
    @Body() dto: SendWhatsAppDto,
    @Headers('x-clinic-id') clinicIdHeader?: string,
  ) {
    try {
      // Priorizar clinicId do header (se disponível)
      const clinicId = clinicIdHeader || dto.clinicId;
      
      if (!clinicId) {
        throw new HttpException(
          'clinicId é obrigatório (via header x-clinic-id ou body.clinicId)',
          HttpStatus.BAD_REQUEST
        );
      }

      // Atualizar DTO com clinicId do header se disponível
      dto.clinicId = clinicId;

      const result = await this.whatsappService.sendMessage(dto);

      return {
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          id: result.id,
          clinicId: result.clinicId,
          to: result.to,
          status: result.status,
          sentAt: result.sentAt,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Erro ao enviar mensagem WhatsApp',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /whatsapp/health
   * Verifica saúde do serviço WhatsApp
   */
  @Get('health')
  @ApiOperation({
    summary: 'Verifica saúde do serviço WhatsApp',
    description: 'Retorna status de conexão e informações do serviço.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do serviço',
    type: WhatsAppHealthDto,
  })
  async health() {
    const health = await this.whatsappService.getHealth();
    
    return {
      success: true,
      data: health,
    };
  }

  /**
   * GET /whatsapp/stats/:clinicId
   * Retorna estatísticas de mensagens por clinicId
   */
  @Get('stats/:clinicId')
  @ApiOperation({
    summary: 'Estatísticas de mensagens por clínica',
    description: 'Retorna contadores de mensagens agrupadas por status para uma clínica específica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  async getStats(@Headers('x-clinic-id') clinicIdHeader: string) {
    if (!clinicIdHeader) {
      throw new HttpException(
        'x-clinic-id header é obrigatório',
        HttpStatus.BAD_REQUEST
      );
    }

    const stats = await this.whatsappService.getStatsByClinicId(clinicIdHeader);
    
    return {
      success: true,
      clinicId: clinicIdHeader,
      data: stats,
    };
  }
}
