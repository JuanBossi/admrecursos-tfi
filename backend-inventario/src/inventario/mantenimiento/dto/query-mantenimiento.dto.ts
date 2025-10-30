import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoMantenimiento } from './update-mantenimiento.dto';

export class QueryMantenimientoDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  equipoId?: string;

  @IsOptional()
  @IsEnum(EstadoMantenimiento)
  estado?: EstadoMantenimiento;
}
