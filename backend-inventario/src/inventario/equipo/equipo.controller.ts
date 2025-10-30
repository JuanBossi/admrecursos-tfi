import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto, BajaEquipoDto } from './dto/update-equipo.dto';
import { QueryEquipoDto } from './dto/query-equipo.dto';
import { Roles } from '../../acceso/auth/decorators/roles.decorator';

@Controller('equipos')
export class EquipoController {
  constructor(private readonly service: EquipoService) {}

  @Post()
  @Roles('Administrador', 'Tecnico')
  create(@Body() dto: CreateEquipoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryEquipoDto) {
    return this.service.findAll(q);
  }

  @Get('garantias')
  garantias(@Query('dias') dias = 30) {
    return this.service.garantiasPorVencer(Number(dias) || 30);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEquipoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/baja')
  darDeBaja(@Param('id') id: string, @Body() body: BajaEquipoDto) {
    return this.service.darDeBaja(id, body);
  }
}
