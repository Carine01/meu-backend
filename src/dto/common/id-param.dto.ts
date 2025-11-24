import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
