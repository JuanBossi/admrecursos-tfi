// src/catalogos/area/dto/create-area.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateAreaDto {
  @IsString() @MaxLength(120) nombre: string;
  @IsOptional() @IsString() @MaxLength(255) descripcion?: string;
}
