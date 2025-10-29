import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialCambios } from './entities/historial-cambios.entity';
import { HistorialCambiosService } from './historial-cambios.service';
import { HistorialCambiosController } from './historial-cambios.controller';
import { EquipoModule } from '../equipo/equipo.module';
import { UsuarioModule } from '../../acceso/usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialCambios]),
    EquipoModule,
    UsuarioModule,
  ],
  controllers: [HistorialCambiosController],
  providers: [HistorialCambiosService],
  exports: [TypeOrmModule],
})
export class HistorialCambiosModule {}
