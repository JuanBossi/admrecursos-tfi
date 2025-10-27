import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { QueryEquipoDto } from './dto/query-equipo.dto';

@Controller('equipos')
export class EquipoController {
  constructor(private readonly service: EquipoService) {}

  @Post()
  create(@Body() dto: CreateEquipoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryEquipoDto) {
    return this.service.findAll(q);
  }

  @Get('alertas/garantia')
  proximasGarantias(@Query('dias') dias?: string) {
    const n = dias ? Number(dias) : 30;
    return this.service.proximasGarantias(Number.isFinite(n) ? n : 30);
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
}
