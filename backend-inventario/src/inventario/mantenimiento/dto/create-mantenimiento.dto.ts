import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum TipoMantenimiento {
  Preventivo = 'Preventivo',
  Correctivo = 'Correctivo',
}

export class CreateMantenimientoDto {
  @IsInt()
  @Min(1)
  equipo_id: number;

  @IsEnum(TipoMantenimiento)
  tipo: TipoMantenimiento;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsDateString()
  fecha_programada: string;

  @IsOptional()
  @IsInt()
  tecnico_id?: number;

  @IsOptional()
  @IsInt()
  created_by?: number;
}
