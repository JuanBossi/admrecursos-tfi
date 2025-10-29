import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MantenimientoService } from './mantenimiento.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { QueryMantenimientoDto } from './dto/query-mantenimiento.dto';

@Controller('mantenimientos')
export class MantenimientoController {
  constructor(private readonly service: MantenimientoService) {}

  @Post()
  create(@Body() dto: CreateMantenimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryMantenimientoDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMantenimientoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
