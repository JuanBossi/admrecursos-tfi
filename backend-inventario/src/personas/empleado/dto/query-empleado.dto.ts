import { IsInt, IsOptional, IsString, Min, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryEmpleadoDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;

  // Busca en nombre, apellido y DNI
  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsNumberString()
  areaId?: string;
}
