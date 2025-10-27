import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoPerifericoDto } from './create-tipo-periferico.dto';
export class UpdateTipoPerifericoDto extends PartialType(CreateTipoPerifericoDto) {}
