import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Nome completo do lead',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({
    description: 'Telefone do lead (formato brasileiro)',
    example: '+5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({
    description: 'ID da clínica (opcional, usa padrão se não fornecido)',
    example: 'elevare-default',
  })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiPropertyOptional({
    description: 'Origem do lead (opcional, usa padrão se não fornecido)',
    example: 'web-form',
  })
  @IsString()
  @IsOptional()
  origem?: string;
}
