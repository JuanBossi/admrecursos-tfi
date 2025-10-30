import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoDto } from './create-equipo.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {}

export class BajaEquipoDto {
  @IsString() @MaxLength(200)
  motivo!: string;
}
