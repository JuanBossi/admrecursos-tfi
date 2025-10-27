import { IsEnum, IsNumberString, IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipoEstado, EquipoTipo } from '../entities/equipo.entity';

export class QueryEquipoDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;

  @IsOptional() @IsString()
  search?: string; // busca en codigoInterno

  @IsOptional() @IsEnum(EquipoTipo)
  tipo?: EquipoTipo;

  @IsOptional() @IsEnum(EquipoEstado)
  estado?: EquipoEstado;

  @IsOptional() @IsNumberString()
  areaId?: string;

  @IsOptional() @IsNumberString()
  proveedorId?: string;

  @IsOptional() @IsNumberString()
  empleadoAsignadoId?: string;

  @IsOptional() @IsDateString()
  garantiaAntesDe?: string; // YYYY-MM-DD → equipos cuya garantía finaliza antes de esta fecha
}
