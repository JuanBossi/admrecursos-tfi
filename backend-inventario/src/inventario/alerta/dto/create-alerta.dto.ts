import { IsNotEmpty, IsOptional, IsString, MaxLength, IsNumberString } from 'class-validator';

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  mensaje: string;

  @IsOptional()
  @IsNumberString()
  equipoId?: string;
}
