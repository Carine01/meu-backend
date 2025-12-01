import { Controller, Post, Get, Body, Headers, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WhatsAppService } from '../services/whatsapp.service';
import { FilaService } from '../services/fila.service';
import { SendWhatsAppDto } from '../dto/send-whatsapp.dto';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly filaService: FilaService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiHeader({ name: 'x-clinic-id', required: false, description: 'Clinic ID (alternative to body)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Message enqueued successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async sendMessage(
    @Body() dto: SendWhatsAppDto,
    @Headers('x-clinic-id') clinicIdHeader?: string,
  ) {
    // Priority: body.clinicId > header x-clinic-id
    const clinicId = dto.clinicId || clinicIdHeader;
    if (!clinicId) {
      throw new Error('clinicId is required (body or header)');
    }

    dto.clinicId = clinicId;
    return this.whatsappService.sendMessage(dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'WhatsApp health check' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service healthy' })
  async healthCheck() {
    const queueStatus = this.filaService.getQueueStatus();
    return {
      status: 'ok',
      queue: queueStatus,
    };
  }
}
