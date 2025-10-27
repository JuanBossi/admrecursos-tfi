import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateTipoPerifericoDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nombre!: string;
}
