import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateProveedorDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  razonSocial!: string;

  // Acepta "20-12345678-3" o "20123456783" (normalizamos a solo dígitos)
  @IsString()
  @Matches(/^(\d{2}-?\d{8}-?\d{1})$/, { message: 'CUIT inválido. Ej: 20-12345678-3' })
  cuit!: string;

  @IsOptional() @IsString() @MaxLength(120)
  contacto?: string;

  @IsOptional() @IsEmail() @MaxLength(180)
  email?: string;

  @IsOptional() @IsString() @MaxLength(60)
  telefono?: string;

  @IsOptional() @IsString() @MaxLength(220)
  direccion?: string;
}
