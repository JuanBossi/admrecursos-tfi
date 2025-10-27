import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsNumberString, IsArray, ArrayUnique } from 'class-validator';

export class CreateUsuarioDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  username!: string;

  @IsEmail() @MaxLength(180)
  email!: string;

  @IsString() @MinLength(6) @MaxLength(100)
  password!: string;

  @IsOptional() @IsNumberString()
  empleadoId?: string;

  @IsOptional() // 1 o 0
  activo?: number;

  @IsOptional() @IsArray() @ArrayUnique()
  rolesIds?: string[]; // opcional: asignar roles al crear
}
