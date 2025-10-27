import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TipoPerifericoService } from './tipo-periferico.service';
import { CreateTipoPerifericoDto } from './dto/create-tipo-periferico.dto';
import { UpdateTipoPerifericoDto } from './dto/update-tipo-periferico.dto';
import { QueryTipoPerifericoDto } from './dto/query-tipo-periferico.dto';

@Controller('tipos-periferico')
export class TipoPerifericoController {
  constructor(private readonly service: TipoPerifericoService) {}

  @Post() create(@Body() dto: CreateTipoPerifericoDto) { return this.service.create(dto); }
  @Get() findAll(@Query() q: QueryTipoPerifericoDto) { return this.service.findAll(q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTipoPerifericoDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
