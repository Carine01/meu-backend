import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

/**
 * DTO para criação de lead
 * 
 * Validações aplicadas:
 * - nome: obrigatório, string, mínimo 2 caracteres
 * - phone: obrigatório, 10-20 caracteres (formato internacional aceito)
 * - clinicId: opcional, string
 * - origem: opcional, string
 */
export class CreateLeadDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  nome!: string;

  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { 
    message: 'Telefone deve conter apenas números, espaços e caracteres válidos (+, -, parênteses)' 
  })
  @Length(10, 20, { message: 'Telefone deve ter entre 10 e 20 caracteres' })
  phone!: string;

  @IsOptional()
  @IsString({ message: 'ID da clínica deve ser uma string' })
  clinicId?: string;

  @IsOptional()
  @IsString({ message: 'Origem deve ser uma string' })
  origem?: string;
}
