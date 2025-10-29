import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumberString, IsDateString } from 'class-validator';
import { MantenimientoTipo, MantenimientoEstado } from '../entities/mantenimiento.entity';

export class CreateMantenimientoDto {
  @IsNotEmpty()
  @IsNumberString()
  equipoId: string;

  @IsEnum(MantenimientoTipo)
  tipo: MantenimientoTipo;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion: string;

  @IsOptional()
  @IsNumberString()
  tecnicoId?: string;

  @IsOptional()
  @IsEnum(MantenimientoEstado)
  estado?: MantenimientoEstado = MantenimientoEstado.PROGRAMADO;

  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
