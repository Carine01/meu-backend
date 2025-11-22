import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Nome completo do lead',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  nome!: string;

  @ApiProperty({
    description: 'Telefone do lead (formato internacional recomendado)',
    example: '+5511999887766',
  })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  phone!: string;

  @ApiProperty({
    description: 'ID da clínica associada ao lead',
    example: 'clinic-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiProperty({
    description: 'Origem do lead (ex: website, instagram, facebook)',
    example: 'website',
    required: false,
  })
  @IsString()
  @IsOptional()
  origem?: string;
}
