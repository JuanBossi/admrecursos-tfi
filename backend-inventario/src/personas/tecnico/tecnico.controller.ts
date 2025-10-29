import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TecnicoService } from './tecnico.service';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';

@Controller('tecnicos')
export class TecnicoController {
  constructor(private readonly service: TecnicoService) {}

  @Post()
  create(@Body() dto: CreateTecnicoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryTecnicoDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTecnicoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
