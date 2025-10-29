import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumberString } from 'class-validator';
import { PerifericoEstado } from '../entities/periferico.entity';

export class CreatePerifericoDto {
  @IsNumberString()
  tipoId!: string; // requerido

  @IsOptional() @IsNumberString()
  equipoId?: string;

  @IsOptional() @IsNumberString()
  marcaId?: string;

  @IsOptional() @IsString() @MaxLength(120)
  modelo?: string;

  @IsOptional() @IsEnum(PerifericoEstado)
  estado?: PerifericoEstado;

   @IsOptional() @IsString() @MaxLength(250)
  especificaciones?: string; // ej: "DDR4 3200MHz 16GB CL16
}
