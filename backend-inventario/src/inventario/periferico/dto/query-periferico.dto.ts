import { IsEnum, IsInt, IsNumberString, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PerifericoEstado } from '../entities/periferico.entity';

export class QueryPerifericoDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;

  @IsOptional() @IsString()
  search?: string; // busca por modelo

  @IsOptional() @IsNumberString()
  equipoId?: string;

  @IsOptional() @IsNumberString()
  tipoId?: string;

  @IsOptional() @IsNumberString()
  marcaId?: string;

  @IsOptional() @IsEnum(PerifericoEstado)
  estado?: PerifericoEstado;
}
