import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TecnicoTipoContrato } from '../entities/tecnico.entity';

export class CreateTecnicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dni: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(180)
  contacto: string;

  @IsOptional()
  @IsEnum(TecnicoTipoContrato)
  tipoContrato?: TecnicoTipoContrato = TecnicoTipoContrato.INTERNO;
}
