import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { QueryProveedorDto } from './dto/query-proveedor.dto';
import { Roles } from '../../acceso/auth/decorators/roles.decorator';

@Controller('proveedores')
export class ProveedorController {
  constructor(private readonly service: ProveedorService) {}

  @Post()
  @Roles('Administrador')
  create(@Body() dto: CreateProveedorDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Tecnico', 'Administrador')
  findAll(@Query() q: QueryProveedorDto) {
    return this.service.findAll(q);
  }

  @Get('by-cuit/:cuit')
  @Roles('Tecnico', 'Administrador')
  findByCuit(@Param('cuit') cuit: string) {
    return this.service.findByCuit(cuit);
  }

  @Get(':id')
  @Roles('Tecnico', 'Administrador')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() dto: UpdateProveedorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
