import { IsString, IsNotEmpty, IsISO8601, IsOptional } from 'class-validator';
export class CreateAgendamentoDto {
  @IsString() @IsNotEmpty() clienteId!: string;
  @IsString() @IsNotEmpty() serviceName!: string;
  @IsISO8601() @IsNotEmpty() scheduledAt!: string;
  @IsString() @IsOptional() clinicId?: string;
}
