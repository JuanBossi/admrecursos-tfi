import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TecnicoService } from './tecnico.service';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';
import { Roles } from '../../acceso/auth/decorators/roles.decorator';

@Controller('tecnicos')
export class TecnicoController {
  constructor(private readonly service: TecnicoService) {}

  @Post()
  @Roles('Administrador')
  create(@Body() dto: CreateTecnicoDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Administrador')
  findAll(@Query() q: QueryTecnicoDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @Roles('Administrador')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() dto: UpdateTecnicoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
