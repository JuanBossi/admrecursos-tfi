import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './entities/equipo.entity';
import { EquipoService } from './equipo.service';
import { EquipoController } from './equipo.controller';
import { HistorialCambiosModule } from '../historial-cambios/historial-cambios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo]), HistorialCambiosModule],
  controllers: [EquipoController],
  providers: [EquipoService],
})
export class EquipoModule {}
