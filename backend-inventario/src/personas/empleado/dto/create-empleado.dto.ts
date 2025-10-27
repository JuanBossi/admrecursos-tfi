import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches, IsNumberString } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nombre!: string;

  @IsString() @IsNotEmpty() @MaxLength(120)
  apellido!: string;

  // DNI: aceptamos con o sin puntos, se normaliza a dígitos en el service
  @IsString()
  @Matches(/^(\d{7,9}|\d{1,2}\.?\d{3}\.?\d{3})$/, { message: 'DNI inválido' })
  dni!: string;

  @IsOptional() @IsString() @MaxLength(180)
  contacto?: string;

  @IsOptional() @IsNumberString()
  areaId?: string;
}
