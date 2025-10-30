import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlertaService } from './alerta.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { QueryAlertaDto } from './dto/query-alerta.dto';
import { Roles } from '../../acceso/auth/decorators/roles.decorator';

@Controller('alertas')
export class AlertaController {
  constructor(private readonly service: AlertaService) {}

  @Post()
  @Roles('Empleado', 'Tecnico')
  create(@Body() dto: CreateAlertaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryAlertaDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('Tecnico', 'Administrador')
  update(@Param('id') id: string, @Body() dto: UpdateAlertaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('Tecnico', 'Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
