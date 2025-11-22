import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendWhatsAppDto {
  @ApiProperty({ description: 'Clinic ID', example: 'clinic-123' })
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({ description: 'Phone number with country code', example: '5511999999999' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  phone: string;

  @ApiProperty({ description: 'Message content', example: 'Hello from clinic!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  message: string;

  @ApiPropertyOptional({ description: 'Additional metadata', example: { campaign: 'welcome' } })
  @IsOptional()
  metadata?: any;
}
