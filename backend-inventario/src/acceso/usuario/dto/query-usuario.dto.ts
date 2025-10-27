import { IsInt, IsOptional, IsString, Min, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUsuarioDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;

  // busca en username o email
  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsNumberString()
  empleadoId?: string;

  // 1/0
  @IsOptional()
  activo?: number;
}
