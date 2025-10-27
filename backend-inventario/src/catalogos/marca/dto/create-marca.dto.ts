import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMarcaDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nombre!: string;

  @IsOptional() @IsString() @MaxLength(255)
  descripcion?: string;
}
