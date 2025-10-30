import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { TipoMantenimiento } from './create-mantenimiento.dto';

/**
 * DTO para actualizar mantenimiento existente
 * Todos los campos son opcionales.
 */
export enum EstadoMantenimiento {
  PROGRAMADO = 'PROGRAMADO',
  EN_PROGRESO = 'EN PROGRESO',
  COMPLETO = 'COMPLETO',
  CANCELADO = 'CANCELADO',
}

export class UpdateMantenimientoDto {
  @IsOptional()
  @IsEnum(TipoMantenimiento)
  tipo?: TipoMantenimiento;

  @IsOptional()
  @IsEnum(EstadoMantenimiento)
  estado?: EstadoMantenimiento;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fecha_programada?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsInt()
  tecnico_id?: number | null;

  @IsOptional()
  @IsInt()
  updated_by?: number | null;
}
