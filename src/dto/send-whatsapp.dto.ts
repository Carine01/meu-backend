import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para envio de mensagens WhatsApp
 * Validação completa + Swagger documentation
 */
export class SendWhatsAppDto {
  @ApiProperty({
    description: 'Telefone destinatário no formato E.164',
    example: '+5511999999999',
    pattern: '^\\+55\\d{10,11}$',
  })
  @IsString({ message: 'Telefone deve ser texto' })
  // Note: Currently hardcoded for Brazil (+55). For international support, update regex
  @Matches(/^\+55\d{10,11}$/, { 
    message: 'Telefone deve estar no formato E.164: +5511999999999' 
  })
  @Transform(({ value }) => value?.trim())
  to!: string;

  @ApiProperty({
    description: 'Mensagem de texto a ser enviada',
    example: 'Olá! Esta é uma mensagem de teste do sistema Elevare.',
    minLength: 1,
    maxLength: 4096,
  })
  @IsString({ message: 'Mensagem deve ser texto' })
  @MinLength(1, { message: 'Mensagem não pode estar vazia' })
  @MaxLength(4096, { message: 'Mensagem deve ter no máximo 4096 caracteres' })
  @Transform(({ value }) => value?.trim())
  message!: string;

  @ApiPropertyOptional({
    description: 'ID da clínica (multitenancy). Se omitido, usa x-clinic-id do header ou default',
    example: 'elevare-01',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Clinic ID deve ter no máximo 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  clinicId?: string;

  @ApiPropertyOptional({
    description: 'Metadados adicionais (leadId, campanhaId, etc)',
    example: { leadId: 'L123', campaignId: 'CAMP_001' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO de resposta do envio
 */
export class SendWhatsAppResponseDto {
  @ApiProperty({
    description: 'ID único da mensagem gerado pelo sistema',
    example: 'WA1732284123456_abc123def',
  })
  messageId!: string;

  @ApiProperty({
    description: 'Status inicial do envio',
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    example: 'sent',
  })
  status!: string;

  @ApiProperty({
    description: 'Timestamp do envio',
    example: '2025-11-22T13:30:00.000Z',
  })
  timestamp!: Date;

  @ApiPropertyOptional({
    description: 'ID retornado pelo provider WhatsApp',
    example: 'wamid.HBgNNTU1MTk5OTk5OTk5OQ==',
  })
  providerMessageId?: string;
}

/**
 * DTO para resposta de health check
 */
export class WhatsAppHealthDto {
  @ApiProperty({
    description: 'Status do serviço',
    example: 'ok',
  })
  status!: string;

  @ApiProperty({
    description: 'Provider WhatsApp em uso',
    example: 'baileys',
  })
  provider!: string;

  @ApiProperty({
    description: 'Se o provider está conectado',
    example: true,
  })
  connected!: boolean;

  @ApiPropertyOptional({
    description: 'Informações adicionais do provider',
  })
  info?: Record<string, any>;
}
