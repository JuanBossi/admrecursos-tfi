import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { HistorialCambiosService } from './historial-cambios.service';
import { CreateHistorialCambiosDto } from './dto/create-historial-cambios.dto';
import { QueryHistorialCambiosDto } from './dto/query-historial-cambios.dto';

@Controller('historial-cambios')
export class HistorialCambiosController {
  constructor(private readonly service: HistorialCambiosService) {}

  @Post()
  create(@Body() dto: CreateHistorialCambiosDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryHistorialCambiosDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('equipo/:equipoId')
  findByEquipo(@Param('equipoId') equipoId: string) {
    return this.service.findByEquipo(equipoId);
  }
}
