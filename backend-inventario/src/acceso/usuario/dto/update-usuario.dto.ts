import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString, MinLength, MaxLength, IsArray, ArrayUnique, IsEmail } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  // Si envías password, se re-hashea
  @IsOptional() @IsString() @MinLength(6) @MaxLength(100)
  password?: string;

  @IsOptional() @IsEmail() @MaxLength(180)
  email?: string;

  @IsOptional() @IsArray() @ArrayUnique()
  rolesIds?: string[];
}
