import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BaseResponseDto {
  @IsBoolean()
  success: boolean = true;

  @IsString()
  @IsOptional()
  message?: string;

  constructor(success: boolean = true, message?: string) {
    this.success = success;
    this.message = message;
  }
}
