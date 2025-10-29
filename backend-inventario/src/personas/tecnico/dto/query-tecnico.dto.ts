import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTecnicoDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
