import { IsString, MinLength, MaxLength, IsEmail, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { toE164 } from '../../utils/phone.util';

/**
 * DTO para criação de leads
 * Valida e transforma dados antes de processar
 */
export class CreateLeadDto {
  @IsString({ message: 'Nome deve ser texto' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nome!: string;

  @Transform(({ value }) => {
    // Converte automaticamente para E.164 antes de validar
    const e164 = toE164(value);
    return e164 || value; // Retorna original se conversão falhar (validação vai pegar)
  })
  @IsString({ message: 'Telefone inválido' })
  @Matches(/^\+55\d{10,11}$/, { 
    message: 'Telefone deve estar no formato +5511999999999' 
  })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Origem deve ter no máximo 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  origem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Clinic ID deve ter no máximo 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  clinicId?: string;
}

/**
 * DTO para atualização parcial de leads
 */
export class UpdateLeadDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nome?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const e164 = toE164(value);
    return e164 || value;
  })
  @IsString({ message: 'Telefone inválido' })
  @Matches(/^\+55\d{10,11}$/, { 
    message: 'Telefone deve estar no formato +5511999999999' 
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  origem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  clinicId?: string;
}

