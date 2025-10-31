import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PerifericoService } from './periferico.service';
import { CreatePerifericoDto } from './dto/create-periferico.dto';
import { UpdatePerifericoDto } from './dto/update-periferico.dto';
import { QueryPerifericoDto } from './dto/query-periferico.dto';
import { Roles } from '../../acceso/auth/decorators/roles.decorator';

@Controller('perifericos')
export class PerifericoController {
  constructor(private readonly service: PerifericoService) {}

  @Post()
  @Roles('Administrador', 'Tecnico')
  create(@Body() dto: CreatePerifericoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryPerifericoDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePerifericoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/asignar/:equipoId')
  asignar(@Param('id') id: string, @Param('equipoId') equipoId: string) {
    return this.service.asignarAEquipo(id, equipoId);
  }

  @Patch(':id/desasignar')
  desasignar(@Param('id') id: string) {
    return this.service.desasignarDeEquipo(id);
  }
}
