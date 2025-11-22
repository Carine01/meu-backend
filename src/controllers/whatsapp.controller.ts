import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';
import { WhatsAppService } from '../services/whatsapp.service';
import { SendWhatsAppDto } from '../dto/send-whatsapp.dto';

/**
 * WhatsAppController - REST endpoints for WhatsApp messaging
 * Supports clinicId multitenancy via x-clinic-id header or body
 */
@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiHeader({
    name: 'x-clinic-id',
    required: false,
    description: 'Clinic ID for multitenancy (overrides body.clinicId)',
  })
  @ApiBody({ type: SendWhatsAppDto })
  @ApiResponse({
    status: 201,
    description: 'Message queued successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'msg_1234567890_abc123',
          clinicId: 'clinic-123',
          to: '+5511999999999',
          message: 'Hello!',
          status: 'sent',
          sentAt: '2025-11-22T13:00:00.000Z',
          createdAt: '2025-11-22T13:00:00.000Z',
          updatedAt: '2025-11-22T13:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendMessage(
    @Body() dto: SendWhatsAppDto,
    @Headers('x-clinic-id') clinicId?: string,
  ) {
    try {
      const result = await this.whatsappService.sendMessage(dto, clinicId);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Error sending WhatsApp message',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Check WhatsApp connection health' })
  @ApiResponse({
    status: 200,
    description: 'Health status',
    schema: {
      example: {
        status: 'connected',
        reconnectAttempts: 0,
        messageCount: 42,
      },
    },
  })
  getHealth() {
    return this.whatsappService.getHealthStatus();
  }
}
