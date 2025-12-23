import { IsOptional, IsString, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Base DTO with common validation patterns
 * Extend this for consistent validation across DTOs
 */
export class BaseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;
}

/**
 * Example: Paginated request DTO
 */
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
