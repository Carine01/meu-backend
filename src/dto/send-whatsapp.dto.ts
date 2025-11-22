import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sending WhatsApp messages
 * Includes validation and Swagger documentation
 */
export class SendWhatsAppDto {
  @ApiProperty({
    description: 'Destination phone number (international format)',
    example: '+5511999999999',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (E.164)',
  })
  to!: string;

  @ApiProperty({
    description: 'Message content to send',
    example: 'Hello from Elevare Atendimento!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({
    description: 'Clinic ID for multitenancy',
    example: 'clinic-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  clinicId?: string;
}
