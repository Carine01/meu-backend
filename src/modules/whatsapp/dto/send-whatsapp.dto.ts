import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendWhatsAppDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  clinicId?: string;
}
