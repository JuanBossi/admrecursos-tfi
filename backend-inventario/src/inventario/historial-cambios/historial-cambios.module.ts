import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialCambios } from './entities/historial-cambios.entity';
import { HistorialCambiosService } from './historial-cambios.service';
import { HistorialCambiosController } from './historial-cambios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialCambios]),
  ],
  controllers: [HistorialCambiosController],
  providers: [HistorialCambiosService],
  exports: [TypeOrmModule],
})
export class HistorialCambiosModule {}
