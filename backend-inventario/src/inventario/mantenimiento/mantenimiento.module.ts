import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mantenimiento } from './entities/mantenimiento.entity';
import { Equipo } from '../equipo/entities/equipo.entity';
import { HistorialCambios } from '../historial-cambios/entities/historial-cambios.entity';
import { MantenimientoService } from './mantenimiento.service';
import { MantenimientoController } from './mantenimiento.controller';
import { EquipoModule } from '../equipo/equipo.module';
import { TecnicoModule } from '../../personas/tecnico/tecnico.module';
import { UsuarioModule } from '../../acceso/usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mantenimiento, Equipo, HistorialCambios]),
    EquipoModule,
    TecnicoModule,
    UsuarioModule,
  ],
  controllers: [MantenimientoController],
  providers: [MantenimientoService],
  exports: [TypeOrmModule],
})
export class MantenimientoModule {}
