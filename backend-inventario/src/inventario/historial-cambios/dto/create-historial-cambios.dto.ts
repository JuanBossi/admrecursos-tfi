import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumberString } from 'class-validator';
import { HistorialAccion } from '../entities/historial-cambios.entity';

export class CreateHistorialCambiosDto {
  @IsNotEmpty()
  @IsNumberString()
  equipoId: string;

  @IsEnum(HistorialAccion)
  accion: HistorialAccion;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  motivo?: string;

  @IsOptional()
  @IsNumberString()
  usuarioId?: string;
}
