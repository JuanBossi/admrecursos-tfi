import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsDateString, IsNumberString } from 'class-validator';
import { EquipoEstado, EquipoTipo } from '../entities/equipo.entity';

export class CreateEquipoDto {
  @IsOptional() @IsNumberString() proveedorId?: string;
  @IsOptional() @IsNumberString() areaId?: string;
  @IsOptional() @IsNumberString() empleadoAsignadoId?: string;

  @IsString() @IsNotEmpty() @MaxLength(60)
  codigoInterno!: string;

  @IsEnum(EquipoTipo)
  tipo!: EquipoTipo;

  @IsOptional() @IsDateString()
  fechaCompra?: string;

  @IsOptional() @IsDateString()
  garantia?: string;

  @IsOptional() @IsEnum(EquipoEstado)
  estado?: EquipoEstado = EquipoEstado.ACTIVO;
}
