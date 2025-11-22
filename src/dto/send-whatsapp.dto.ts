import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para envio de mensagens WhatsApp
 * Inclui validação com class-validator e documentação Swagger
 */
export class SendWhatsAppDto {
  @ApiProperty({
    description: 'ID da clínica (multitenancy)',
    example: 'clinic-123',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  clinicId!: string;

  @ApiProperty({
    description: 'Número de telefone do destinatário no formato internacional (com código do país)',
    example: '+5511999999999',
    minLength: 10,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  to!: string;

  @ApiProperty({
    description: 'Mensagem a ser enviada',
    example: 'Olá! Sua consulta está confirmada para amanhã às 10h.',
    minLength: 1,
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({
    description: 'Metadata adicional para a mensagem',
    example: { campaignId: 'camp-123', templateId: 'tmpl-456' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
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
    description: 'Estado da conexão WhatsApp',
    example: 'connected',
  })
  connection!: string;

  @ApiPropertyOptional({
    description: 'Informações adicionais',
  })
  info?: Record<string, any>;
}
