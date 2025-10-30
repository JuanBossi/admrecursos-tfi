import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MantenimientoService } from './mantenimiento.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { QueryMantenimientoDto } from './dto/query-mantenimiento.dto';
import { Roles } from '../../acceso/auth/decorators/roles.decorator';

@Controller('mantenimientos')
export class MantenimientoController {
  constructor(private readonly service: MantenimientoService) {}

  @Post()
  @Roles('Tecnico', 'Administrador')
  create(@Body() dto: CreateMantenimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryMantenimientoDto) {
    return this.service.findAll(q);
  }

  @Get('proximos')
  async proximos(@Query('dias') dias = 30) {
    const d = Number(dias) || 30;
    return this.service.proximos(d);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('Tecnico', 'Administrador')
  update(@Param('id') id: string, @Body() dto: UpdateMantenimientoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('Tecnico', 'Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
