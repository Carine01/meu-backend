import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendWhatsAppDto {
  @ApiProperty({ example: '5511999999999' })
  @IsString()
  @IsNotEmpty()
    phone!: string;

  @ApiProperty({ example: 'Olá, tenho interesse...' })
  @IsString()
  @IsNotEmpty()
    message!: string;

  @ApiProperty({ example: 'CLINIC_01', required: false })
  @IsString()
  @IsOptional()
    clinicId?: string;
}
