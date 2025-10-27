import { PartialType } from '@nestjs/mapped-types';
import { CreatePerifericoDto } from './create-periferico.dto';
export class UpdatePerifericoDto extends PartialType(CreatePerifericoDto) {}
