import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { QueryMarcaDto } from './dto/query-marca.dto';

@Controller('marcas')
export class MarcaController {
  constructor(private readonly service: MarcaService) {}

  @Post()
  create(@Body() dto: CreateMarcaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryMarcaDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMarcaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
