import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RolService } from './rol.service';

@Controller('roles')
export class RolController {
  constructor(private readonly service: RolService) {}

  @Post()
  create(@Body() body: { nombre: string; descripcion?: string }) {
    return this.service.create(body.nombre, body.descripcion);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { nombre?: string; descripcion?: string }) {
    return this.service.update(id, body.nombre, body.descripcion);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
