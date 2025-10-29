import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alerta } from './entities/alerta.entity';
import { AlertaService } from './alerta.service';
import { AlertaController } from './alerta.controller';
import { EquipoModule } from '../equipo/equipo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alerta]),
    EquipoModule,
  ],
  controllers: [AlertaController],
  providers: [AlertaService],
  exports: [TypeOrmModule],
})
export class AlertaModule {}
